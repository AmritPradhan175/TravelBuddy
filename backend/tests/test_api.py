"""TravelBuddy Automated Backend Tests."""
import json
import unittest
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app

class TravelBuddyAPITestCase(unittest.TestCase):
    def setUp(self):
        """Set up Flask test client."""
        self.app = create_app('development')
        self.client = self.app.test_client()

    def test_health_check(self):
        """Test health endpoint."""
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data.get('status'), 'healthy')
        self.assertEqual(data.get('service'), 'TravelBuddy REST API')

    def test_auth_login_success(self):
        """Test login with seeded credentials."""
        res = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps({
                'email': 'explorer@travelbuddy.ai',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        self.assertIn('token', data.get('data', {}))
        self.assertEqual(data['data']['user']['email'], 'explorer@travelbuddy.ai')

    def test_auth_login_invalid_password(self):
        """Test login with wrong password."""
        res = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps({
                'email': 'explorer@travelbuddy.ai',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 401)

    def test_destinations_list(self):
        """Test listing destinations."""
        res = self.client.get('/api/v1/destinations?limit=10')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        destinations = data['data']['destinations']
        self.assertGreater(len(destinations), 0)
        self.assertEqual(data['data']['pagination']['total'], 100)

    def test_destination_detail(self):
        """Test single destination retrieval."""
        res = self.client.get('/api/v1/destinations/1')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        dest = data['data']['destination']
        self.assertEqual(dest['id'], 1)
        self.assertIn('destination_name', dest)

    def test_ml_similar_destinations(self):
        """Test TF-IDF Cosine Similarity recommendation engine."""
        res = self.client.get('/api/v1/destinations/1/similar?limit=3')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        sims = data['data']['similar_destinations']
        self.assertGreater(len(sims), 0)
        # Extract destination IDs and verify self (1) is excluded
        sim_ids = [s.get('destination', {}).get('id') for s in sims]
        self.assertNotIn(1, sim_ids)

    def test_recommendations_engine(self):
        """Test multi-criteria recommendation scoring."""
        res = self.client.post(
            '/api/v1/recommendations',
            data=json.dumps({
                'preferred_regions': ['North India'],
                'preferred_categories': ['Mountain', 'Adventure'],
                'budget_tier': 'mid_range',
                'limit': 5
            }),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        recs = data['data']['recommendations']
        self.assertGreater(len(recs), 0)
        self.assertIn('match_score', recs[0])
        self.assertIn('destination', recs[0])

    def test_generate_itinerary(self):
        """Test rule-based day-by-day itinerary planner."""
        res = self.client.post(
            '/api/v1/trips/generate',
            data=json.dumps({
                'destination_name': 'Goa',
                'duration_days': 3,
                'budget_tier': 'mid_range',
                'traveler_count': 2
            }),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        itinerary = data['data']
        self.assertEqual(itinerary['duration_days'], 3)
        self.assertEqual(len(itinerary['days']), 3)

    def test_assistant_chat(self):
        """Test grounded AI travel assistant."""
        res = self.client.post(
            '/api/v1/assistant/chat',
            data=json.dumps({
                'message': 'Tell me about the safety and budget for Goa'
            }),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        self.assertIn('text', data['data'])
        self.assertIn('Goa', data['data']['text'])

    def test_authenticated_trip_and_favorite_flow(self):
        """Test authenticated user token workflow: login -> create trip -> add favorite."""
        # 1. Login to get token
        login_res = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps({
                'email': 'explorer@travelbuddy.ai',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        token = json.loads(login_res.data)['data']['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 2. Save a trip to the database
        trip_res = self.client.post(
            '/api/v1/trips',
            headers=headers,
            data=json.dumps({
                'destination_name': 'Goa',
                'duration_days': 4,
                'traveler_count': 2,
                'budget_tier': 'mid_range',
                'estimated_cost_inr': 24000.0,
                'days': [
                    {'day_number': 1, 'theme': 'Arrival and North Goa beaches'}
                ]
            }),
            content_type='application/json'
        )
        self.assertEqual(trip_res.status_code, 201)
        trip_data = json.loads(trip_res.data)['data']['trip']
        trip_id = trip_data['id']

        # 3. List trips
        list_trips_res = self.client.get('/api/v1/trips', headers=headers)
        self.assertEqual(list_trips_res.status_code, 200)

        # 4. Delete the test trip
        del_trip_res = self.client.delete(f'/api/v1/trips/{trip_id}', headers=headers)
        self.assertEqual(del_trip_res.status_code, 200)

        # 5. Add favorite
        fav_res = self.client.post(
            '/api/v1/favorites',
            headers=headers,
            data=json.dumps({'destination_id': 2}),
            content_type='application/json'
        )
        self.assertIn(fav_res.status_code, [200, 201])

        # 6. Delete favorite
        del_fav_res = self.client.delete('/api/v1/favorites/2', headers=headers)
        self.assertEqual(del_fav_res.status_code, 200)

        # 7. Test Search History (GET, POST, DELETE)
        hist_post_res = self.client.post(
            '/api/v1/history/search',
            headers=headers,
            data=json.dumps({'query': 'Manali snowfall'}),
            content_type='application/json'
        )
        self.assertEqual(hist_post_res.status_code, 201)

        hist_get_res = self.client.get('/api/v1/history/search', headers=headers)
        self.assertEqual(hist_get_res.status_code, 200)
        hist_data = json.loads(hist_get_res.data)
        self.assertIn('history', hist_data['data'])

        hist_del_res = self.client.delete('/api/v1/history/search', headers=headers)
        self.assertEqual(hist_del_res.status_code, 200)

        # 8. Test Destination Views History (POST, GET, DELETE)
        view_post_res = self.client.post(
            '/api/v1/history/views',
            headers=headers,
            data=json.dumps({'destination_id': 1}),
            content_type='application/json'
        )
        self.assertEqual(view_post_res.status_code, 201)

        view_get_res = self.client.get('/api/v1/history/views', headers=headers)
        self.assertEqual(view_get_res.status_code, 200)

        view_del_res = self.client.delete('/api/v1/history/views', headers=headers)
        self.assertEqual(view_del_res.status_code, 200)

if __name__ == '__main__':
    unittest.main()

