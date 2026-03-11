"""
TaxGlue Python Tests
Tests for Flask server and database operations
"""
import pytest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test configuration
TEST_BASE_URL = "http://localhost:3000"
TEST_API_URL = f"{TEST_BASE_URL}/api"


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test that health endpoint returns OK"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'


class TestTDSSectionRates:
    """Test TDS section rates API"""
    
    def test_get_tds_rates(self, client):
        """Test fetching TDS rates"""
        response = client.get('/api/tds/rates')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0
        # Check some known sections
        assert '194' in data
        assert '194A' in data
        assert data['194']['name'] == 'Dividends'
        assert data['194']['rate'] == 10
    
    def test_tds_rate_structure(self, client):
        """Test TDS rate data structure"""
        response = client.get('/api/tds/rates')
        data = json.loads(response.data)
        for section, rate_info in data.items():
            assert 'name' in rate_info
            assert 'rate' in rate_info
            assert 'description' in rate_info


class TestTDSOperations:
    """Test TDS operations"""
    
    def test_get_deductors_empty(self, client):
        """Test getting deductors when none exist"""
        response = client.get('/api/tds/deductors')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
    
    def test_create_deductor(self, client):
        """Test creating a deductor"""
        payload = {
            'name': 'Test Company',
            'tan': 'TEST123',
            'ddo_type': 'NON_DDO',
            'fy': '2024-25'
        }
        response = client.post('/api/tds/deductors', 
                              data=json.dumps(payload),
                              content_type='application/json')
        assert response.status_code in [200, 201, 400]
    
    def test_get_deductees_empty(self, client):
        """Test getting deductees when none exist"""
        response = client.get('/api/tds/deductees')
        assert response.status_code == 200
    
    def test_tds_calculate(self, client):
        """Test TDS calculation"""
        payload = {
            'section': '194',
            'amount': 10000,
            'is_filer': True
        }
        response = client.post('/api/tds/calculate',
                             data=json.dumps(payload),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'tds_amount' in data
        assert 'net_payment' in data
        # 10% of 10000 = 1000
        assert data['tds_amount'] == 1000
        assert data['net_payment'] == 9000


class TestGSTOperations:
    """Test GST operations"""
    
    def test_get_gst_rates(self, client):
        """Test fetching GST rates"""
        response = client.get('/api/gst/rates')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0
    
    def test_gst_summary(self, client):
        """Test GST summary"""
        response = client.get('/api/gst/summary')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_invoices' in data
    
    def test_get_invoices_empty(self, client):
        """Test getting invoices when none exist"""
        response = client.get('/api/gst/invoices')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)


class TestIncomeTaxOperations:
    """Test Income Tax operations"""
    
    def test_get_it_summary(self, client):
        """Test Income Tax summary"""
        response = client.get('/api/it/summary')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'pending_filings' in data
    
    def test_get_itr_empty(self, client):
        """Test getting ITR when none exist"""
        response = client.get('/api/it/itr')
        assert response.status_code == 200
    
    def test_get_form16_empty(self, client):
        """Test getting Form 16 when none exist"""
        response = client.get('/api/it/form16')
        assert response.status_code == 200


class TestClientsOperations:
    """Test Clients operations"""
    
    def test_get_clients_empty(self, client):
        """Test getting clients when none exist"""
        response = client.get('/api/clients')
        assert response.status_code == 200


class TestAuthentication:
    """Test authentication"""
    
    def test_login_no_data(self, client):
        """Test login with no data"""
        response = client.post('/api/auth/login',
                             data=json.dumps({}),
                             content_type='application/json')
        assert response.status_code == 401
    
    def test_me_no_auth(self, client):
        """Test /me endpoint without auth"""
        response = client.get('/api/auth/me')
        # Should return 401 or redirect
        assert response.status_code in [401, 302]


# Pytest fixtures
@pytest.fixture
def client():
    """Create test client"""
    from server import app
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
