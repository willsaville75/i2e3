import { useEffect, useState } from 'react';
import MediaLibrary from '../../components/MediaLibrary';

export default function MediaPage() {
  const [testData, setTestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MediaPage mounted');
    
    // Test API connection
    fetch('/api/media?limit=5')
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('API test response:', data);
        setTestData(data);
      })
      .catch(err => {
        console.error('API test error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Media Library Page
      </h1>
      
      {error && (
        <div style={{ background: 'red', color: 'white', padding: '10px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}
      
      {testData && (
        <div style={{ background: 'green', color: 'white', padding: '10px', marginBottom: '20px' }}>
          API Working! Found {testData.data?.length || 0} media items
        </div>
      )}
      
      <MediaLibrary />
    </div>
  );
} 