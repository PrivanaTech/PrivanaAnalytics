import { prisma } from '../prismaClient.js';

// **1. Total Events Count**
export const getTotalEvents = async () => {
  const totalEvents = await prisma.event.count();
  return totalEvents;
};

// **2. Events Count Grouped by Type**
export const getEventsByType = async () => {
    try {
        // Group events by type_id and count the occurrences
        const eventsByType = await prisma.event.groupBy({
          by: ['type_id'],
          _count: {
            type_id: true, // Count occurrences of each type_id
          },
          orderBy: {
            _count: {
              type_id: 'desc', // Sort by the count in descending order
            },
          },
        });
    
        // Enrich the grouped data with event type details
        const enrichedData = await Promise.all(
          eventsByType.map(async (group) => {
            const eventType = await prisma.eventType.findUnique({
              where: { id: group.type_id },
            });
            return {
              type: eventType.name,
              description: eventType.description,
              count: group._count.type_id,
            };
          })
        );
    
        return enrichedData;
    } catch (error) {
        console.error('Error fetching events by type:', error.message);
        throw new Error('Failed to fetch events by type');
    }
};

// **3. Events Count Grouped by User**
export const getEventsByUser = async () => {
    try {
        // Group events by user_id and count the occurrences
        const eventsByUser = await prisma.event.groupBy({
          by: ['user_id'],
          _count: {
            user_id: true, // Count occurrences of each user_id
          },
          orderBy: {
            _count: {
              user_id: 'desc', // Sort by the count in descending order
            },
          },
        });
    
        // Enrich the grouped data with user details
        const enrichedData = await Promise.all(
          eventsByUser.map(async (group) => {
            const user = group.user_id
              ? await prisma.user.findUnique({
                  where: { id: group.user_id },
                })
              : { name: 'Anonymous' };
            return {
              user: user.name,
              count: group._count.user_id,
            };
          })
        );
    
        return enrichedData;
    } catch (error) {
        console.error('Error fetching events by user:', error.message);
        throw new Error('Failed to fetch events by user');
    }
};

// **4. Event Trends (Daily)**
export const getDailyEventTrends = async (startDate, endDate) => {
    try {
        // Parse and validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).');
        }
    
        // Fetch events within the date range
        const events = await prisma.event.findMany({
          where: {
            timestamp: {
              gte: start,
              lte: end,
            },
          },
          select: { timestamp: true },
        });
    
        if (events.length === 0) {
          return []; // Return empty array if no events exist in the range
        }
    
        // Create a map for counting events per day
        const trendsMap = new Map();
    
        events.forEach((event) => {
          const date = event.timestamp.toISOString().split('T')[0]; // Extract the date part
          trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
        });
    
        // Convert map to an array of objects
        const trends = Array.from(trendsMap.entries()).map(([date, count]) => ({
          date,
          count,
        }));
    
        // Sort trends by date
        trends.sort((a, b) => new Date(a.date) - new Date(b.date));
    
        return trends;
    } catch (error) {
        console.error('Error fetching daily event trends:', error.message);
        throw new Error('Failed to fetch daily event trends');
    }
};

// **5. Top Users by Event Count**
export const getTopUsers = async (limit = 5) => {
    try {
        // Group events by user_id and count the occurrences
        const topUsers = await prisma.event.groupBy({
          by: ['user_id'],
          _count: {
            user_id: true, // Count occurrences of each user_id
          },
          orderBy: {
            _count: {
              user_id: 'desc', // Sort by the count in descending order
            },
          },
          take: limit, // Limit the number of users retrieved
        });
    
        // Enrich the grouped data with user details
        const enrichedTopUsers = await Promise.all(
          topUsers.map(async (group) => {
            const user = group.user_id
              ? await prisma.user.findUnique({
                  where: { id: group.user_id },
                })
              : { name: 'Anonymous' };
            return {
              user: user.name,
              count: group._count.user_id,
            };
          })
        );
    
        return enrichedTopUsers;
    } catch (error) {
        console.error('Error fetching top users:', error.message);
        throw new Error('Failed to fetch top users');
    }
};

// **6. Filtered Events by Type and Date Range**
export const getFilteredEvents = async (typeId, startDate, endDate) => {
    try {
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Validate parsed dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).');
        }
    
        // Ensure typeId is an integer
        if (isNaN(typeId)) {
          throw new Error('Invalid typeId. It must be a valid integer.');
        }
    
        // Fetch filtered events
        const filteredEvents = await prisma.event.findMany({
          where: {
            type_id: parseInt(typeId, 10), // Convert typeId to integer
            timestamp: {
              gte: start,
              lte: end,
            },
          },
          orderBy: { timestamp: 'desc' },
        });
    
        return filteredEvents;
    } catch (error) {
        console.error('Error fetching filtered events:', error.message);
        throw new Error('Failed to fetch filtered events');
    }
};

// **7. Average Events Per Day**
export const getAverageEventsPerDay = async (startDate, endDate) => {
    try {
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Validate parsed dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ).');
        }
    
        // Calculate the number of days in the range
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days <= 0) {
          throw new Error('End date must be after start date.');
        }
    
        // Get the total number of events within the range
        const totalEvents = await prisma.event.count({
          where: {
            timestamp: {
              gte: start,
              lte: end,
            },
          },
        });
    
        // Calculate the average
        const average = totalEvents / days;
    
        return parseFloat(average.toFixed(2)); // Return the average rounded to 2 decimal places
    } catch (error) {
        console.error('Error calculating average events per day:', error.message);
        throw new Error('Failed to calculate average events per day');
    }
};

// **8. Most Popular Event Types**
export const getMostPopularTypes = async (limit = 3) => {
    try {
        // Group events by type_id and count the occurrences
        const popularTypes = await prisma.event.groupBy({
          by: ['type_id'],
          _count: {
            type_id: true, // Count occurrences of each type_id
          },
          orderBy: {
            _count: {
              type_id: 'desc', // Sort by count in descending order
            },
          },
          take: limit, // Limit the results to the top N types
        });
    
        // Enrich the grouped data with event type details
        const enrichedPopularTypes = await Promise.all(
          popularTypes.map(async (group) => {
            const eventType = await prisma.eventType.findUnique({
              where: { id: group.type_id },
            });
            return {
              type: eventType.name,
              description: eventType.description,
              count: group._count.type_id,
            };
          })
        );
    
        return enrichedPopularTypes;
    } catch (error) {
        console.error('Error fetching most popular event types:', error.message);
        throw new Error('Failed to fetch most popular event types');
    }
};

// **9. Event Type Distribution**
export const getEventTypeDistribution = async () => {
    try {
        // Get the total number of events
        const totalEvents = await prisma.event.count();
    
        if (totalEvents === 0) {
          return []; // Return an empty array if no events exist
        }
    
        // Group events by type_id and count the occurrences
        const eventDistribution = await prisma.event.groupBy({
          by: ['type_id'],
          _count: {
            type_id: true, // Count occurrences of each type_id
          },
        });
    
        // Enrich the grouped data with event type details and calculate percentages
        const distribution = await Promise.all(
          eventDistribution.map(async (group) => {
            const eventType = await prisma.eventType.findUnique({
              where: { id: group.type_id },
            });
            return {
              type: eventType.name,
              description: eventType.description,
              percentage: ((group._count.type_id / totalEvents) * 100).toFixed(2),
            };
          })
        );
    
        return distribution;
    } catch (error) {
        console.error('Error fetching event type distribution:', error.message);
        throw new Error('Failed to fetch event type distribution');
    }
};

// **10. Event Heatmap by Hour**
export const getEventHeatmap = async () => {
    try {
        // Fetch all event timestamps
        const events = await prisma.event.findMany({
          select: { timestamp: true },
        });
    
        if (events.length === 0) {
          return []; // Return an empty array if no events exist
        }
    
        // Count events for each hour of the day
        const heatmap = Array(24).fill(0); // Initialize array for 24 hours
        events.forEach((event) => {
          const hour = new Date(event.timestamp).getHours();
          heatmap[hour] += 1;
        });
    
        // Format the data for better readability
        const formattedHeatmap = heatmap.map((count, hour) => ({
          hour: `${hour}:00`,
          count,
        }));
    
        return formattedHeatmap;
    } catch (error) {
        console.error('Error fetching event heatmap:', error.message);
        throw new Error('Failed to fetch event heatmap');
    }
};
