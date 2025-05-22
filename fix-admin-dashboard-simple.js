// Simplified admin dashboard loader - focuses only on product notifications
// This replaces the complex database loading function with a simpler version

// Simple function to load only product-related activities
async function loadProductActivitiesOnly() {
  try {
    console.log('🔄 Loading product activities only...');
    
    if (!window.directSupabaseClient) {
      console.warn('Supabase client not available, using sample data');
      loadSampleData();
      return;
    }

    // Clear existing data
    pendingActivities = [];
    recentActivities = [];

    // 1. Fetch pending product notifications
    try {
      const { data: pendingProducts, error: pendingError } = await window.directSupabaseClient
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .in('type', ['product_added', 'product_updated', 'product_deleted', 'product_low_stock'])
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Transform product notifications to pending activities
      if (pendingProducts && pendingProducts.length > 0) {
        pendingProducts.forEach(notification => {
          pendingActivities.push({
            id: notification.id,
            title: notification.title,
            description: notification.description,
            priority: notification.priority || 'medium',
            time: formatTimeAgo(notification.created_at),
            type: notification.type,
            icon: getProductIcon(notification.type),
            metadata: notification.metadata || {}
          });
        });
      }

      console.log(`✅ Loaded ${pendingProducts.length} pending product notifications`);
    } catch (error) {
      console.warn('Error loading pending product notifications:', error);
    }

    // 2. Fetch recent product activities
    try {
      const { data: recentProducts, error: recentError } = await window.directSupabaseClient
        .from('recent_activities')
        .select('*')
        .in('type', ['product_added', 'product_updated', 'product_deleted'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // Transform recent activities
      if (recentProducts && recentProducts.length > 0) {
        recentProducts.forEach(activity => {
          recentActivities.push({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            priority: activity.priority || 'medium',
            completedTime: formatTimeAgo(activity.created_at),
            completedBy: activity.created_by || 'Admin',
            action: 'completed',
            type: 'success',
            icon: activity.icon || getProductIcon(activity.type)
          });
        });
      }

      console.log(`✅ Loaded ${recentProducts.length} recent product activities`);
    } catch (error) {
      console.warn('Error loading recent product activities:', error);
    }

    // 3. Add some sample non-product activities if needed
    if (pendingActivities.length === 0) {
      pendingActivities.push({
        id: 'sample-1',
        title: 'No Pending Product Activities',
        description: 'All product activities are up to date. Add a product to see notifications here.',
        priority: 'low',
        time: 'Just now',
        type: 'info',
        icon: '<i class="fas fa-info-circle"></i>'
      });
    }

    if (recentActivities.length === 0) {
      recentActivities.push({
        id: 'sample-2',
        title: 'No Recent Product Activities',
        description: 'Recent product activities will appear here when you add, edit, or delete products.',
        priority: 'low',
        completedTime: 'Just now',
        completedBy: 'System',
        action: 'info',
        type: 'info',
        icon: '<i class="fas fa-info-circle"></i>'
      });
    }

    console.log('✅ Product activities loaded successfully:', {
      pending: pendingActivities.length,
      recent: recentActivities.length
    });

    // Render the activities
    renderPendingActivities();
    renderRecentActivities();

  } catch (error) {
    console.error('Error loading product activities:', error);
    loadSampleData();
  }
}

// Helper function to get appropriate icon for product activities
function getProductIcon(type) {
  const icons = {
    'product_added': '<i class="fas fa-plus-circle text-success"></i>',
    'product_updated': '<i class="fas fa-edit text-warning"></i>',
    'product_deleted': '<i class="fas fa-trash text-danger"></i>',
    'product_low_stock': '<i class="fas fa-exclamation-triangle text-warning"></i>'
  };
  return icons[type] || '<i class="fas fa-box"></i>';
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Replace the complex loadActivitiesFromDatabase function
window.loadProductActivitiesOnly = loadProductActivitiesOnly;
