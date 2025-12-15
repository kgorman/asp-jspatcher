function(data, timestamp) {
  // Validate input data
  if (!data || typeof data !== 'object') {
    return null;
  }
  
  // Process the data
  const processed = {
    ...data,
    processedAt: new Date(timestamp),
    enriched: true,
    score: Math.random() * 100
  };
  
  // Add custom business logic
  if (data.category === 'premium') {
    processed.priority = 'high';
    processed.multiplier = 2.0;
  } else {
    processed.priority = 'normal';
    processed.multiplier = 1.0;
  }
  
  return processed;
}