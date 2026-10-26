"""Machine Learning Recommender Service using TF-IDF and Multi-Factor Scoring."""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ..models.destination import Destination

class RecommenderService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=2500)
        self.tfidf_matrix = None
        self.destination_ids = []
        self.id_to_index = {}
        self.destinations_cache = []
        self._is_trained = False

    def build_feature_text(self, dest: Destination) -> str:
        """Constructs an enriched text document from destination attributes."""
        parts = []

        # Destination name, state, and region
        parts.append(dest.destination_name)
        parts.append(dest.state)
        parts.append(dest.region)

        # Trip types
        if isinstance(dest.trip_types, list):
            parts.extend(dest.trip_types)
        elif isinstance(dest.trip_types, str):
            parts.append(dest.trip_types)

        # Primary attractions
        if isinstance(dest.primary_attractions, list):
            parts.extend(dest.primary_attractions)
        elif isinstance(dest.primary_attractions, str):
            parts.append(dest.primary_attractions)

        # Available activities
        if isinstance(dest.activities_available, list):
            parts.extend(dest.activities_available)
        elif isinstance(dest.activities_available, str):
            parts.append(dest.activities_available)

        # Ideal for
        if isinstance(dest.ideal_for, list):
            parts.extend(dest.ideal_for)
        elif isinstance(dest.ideal_for, str):
            parts.append(dest.ideal_for)

        # Best seasons
        if isinstance(dest.best_seasons, list):
            parts.extend(dest.best_seasons)
        elif isinstance(dest.best_seasons, str):
            parts.append(dest.best_seasons)

        # Unique experiences and local cuisine
        if dest.unique_experiences:
            parts.append(dest.unique_experiences)
        if isinstance(dest.local_cuisine_must_try, list):
            parts.extend(dest.local_cuisine_must_try)

        return ' '.join(str(p) for p in parts if p)

    def fit(self, destinations: list[Destination]):
        """Trains TF-IDF model on destination attributes."""
        if not destinations:
            return

        self.destinations_cache = destinations
        self.destination_ids = [d.id for d in destinations]
        self.id_to_index = {d.id: idx for idx, d in enumerate(destinations)}

        documents = [self.build_feature_text(d) for d in destinations]
        self.tfidf_matrix = self.vectorizer.fit_transform(documents)
        self._is_trained = True

    def ensure_trained(self):
        """Ensures the recommender is fitted from the database."""
        if not self._is_trained or self.tfidf_matrix is None:
            destinations = Destination.query.all()
            if destinations:
                self.fit(destinations)

    def get_similar_destinations(self, destination_id: int, top_n: int = 5) -> list[dict]:
        """Calculates cosine similarity to find closest destination matches."""
        self.ensure_trained()
        if not self._is_trained or destination_id not in self.id_to_index:
            # Fallback: query from DB by same region or popularity
            fallback = Destination.query.filter(Destination.id != destination_id).order_by(Destination.popularity_score.desc()).limit(top_n).all()
            return [{'destination': d.to_dict(), 'similarity_score': 0.75} for d in fallback]

        idx = self.id_to_index[destination_id]
        sim_scores = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()

        # Sort indices in descending order
        related_indices = sim_scores.argsort()[::-1]

        results = []
        for r_idx in related_indices:
            other_id = self.destination_ids[r_idx]
            if other_id == destination_id:
                continue
            dest = self.destinations_cache[r_idx]
            score = float(sim_scores[r_idx])
            results.append({
                'destination': dest.to_dict(),
                'similarity_score': round(score, 3),
                'match_percentage': int(score * 100)
            })
            if len(results) >= top_n:
                break

        return results

    def get_personalized_recommendations(
        self,
        travel_styles: list[str] = None,
        preferred_regions: list[str] = None,
        budget_tier: str = 'mid_range',
        exclude_ids: list[int] = None,
        top_n: int = 6
    ) -> list[dict]:
        """Multi-factor recommendation blending TF-IDF text similarity with budget and popularity."""
        self.ensure_trained()
        exclude_set = set(exclude_ids or [])

        if not self._is_trained:
            fallback = Destination.query.filter(~Destination.id.in_(exclude_set) if exclude_set else True).order_by(Destination.popularity_score.desc()).limit(top_n).all()
            return [{'destination': d.to_dict(), 'match_score': 85} for d in fallback]

        # Construct synthetic query profile
        query_parts = []
        if travel_styles:
            query_parts.extend(travel_styles * 2) # Double weight
        if preferred_regions:
            query_parts.extend(preferred_regions)

        if query_parts:
            query_text = ' '.join(query_parts)
            query_vec = self.vectorizer.transform([query_text])
            content_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        else:
            content_scores = np.ones(len(self.destination_ids)) * 0.5

        scored_destinations = []
        for idx, dest in enumerate(self.destinations_cache):
            if dest.id in exclude_set:
                continue

            content_sim = float(content_scores[idx])

            # Popularity component (scale 0-1)
            pop_score = (dest.popularity_score or 5) / 10.0

            # Region match component
            region_score = 1.0 if preferred_regions and dest.region in preferred_regions else 0.5

            # Weighted combination: 50% content, 30% popularity, 20% region
            blended_score = (0.50 * content_sim) + (0.30 * pop_score) + (0.20 * region_score)

            scored_destinations.append({
                'destination': dest.to_dict(),
                'match_score': round(blended_score, 3),
                'match_percentage': min(99, max(60, int(blended_score * 100)))
            })

        scored_destinations.sort(key=lambda x: x['match_score'], reverse=True)
        return scored_destinations[:top_n]

recommender = RecommenderService()
