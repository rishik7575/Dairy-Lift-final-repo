// Supabase Admin Dashboard Integration
// This file handles database operations for the admin dashboard

// Supabase configuration
const SUPABASE_URL = 'https://eseynihfxxojisyqmigk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZXluaWhmeHhvamlzeXFtaWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTEzODksImV4cCI6MjA2MzQ4NzM4OX0.1nU7McnxI_Cx2zK2UMpxc5t1ZK0VJnx2sz_xFS0Np08';

// Initialize Supabase client
let supabaseClient;

// Initialize Supabase
function initSupabase() {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    return true;
  } else {
    console.error('Supabase library not loaded');
    return false;
  }
}

// Database operations
const SupabaseAdmin = {
  // Initialize the client
  init() {
    return initSupabase();
  },

  // Get pending farm visit requests
  async getPendingRequests() {
    try {
      const { data, error } = await supabaseClient
        .from('notifications')
        .select(`
          *,
          farm_visit_requests (
            id,
            name,
            email,
            phone,
            visit_date,
            message,
            status
          )
        `)
        .eq('status', 'pending')
        .eq('type', 'farm_visit_request')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched pending requests:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  // Get recent activities
  async getRecentActivities() {
    try {
      const { data, error } = await supabaseClient
        .from('notifications')
        .select(`
          *,
          farm_visit_requests (
            id,
            name,
            email,
            phone,
            visit_date,
            message,
            status
          )
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched recent activities:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  // Accept a farm visit request
  async acceptRequest(notificationId, requestId) {
    try {
      // Update the farm visit request status
      const { error: requestError } = await supabaseClient
        .from('farm_visit_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update the notification status
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .update({
          status: 'completed',
          action_taken: 'accepted',
          completed_by: 'Admin',
          completed_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (notificationError) throw notificationError;

      return { success: true };
    } catch (error) {
      console.error('Error accepting request:', error);
      return { success: false, error: error.message };
    }
  },

  // Reject a farm visit request
  async rejectRequest(notificationId, requestId) {
    try {
      // Update the farm visit request status
      const { error: requestError } = await supabaseClient
        .from('farm_visit_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update the notification status
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .update({
          status: 'completed',
          action_taken: 'rejected',
          completed_by: 'Admin',
          completed_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (notificationError) throw notificationError;

      return { success: true };
    } catch (error) {
      console.error('Error rejecting request:', error);
      return { success: false, error: error.message };
    }
  }
};

// Transform database data to match existing UI format
function transformPendingData(dbData) {
  console.log('Transforming pending data:', dbData);
  return dbData.map(item => {
    const visitData = item.farm_visit_requests;
    const visitDate = visitData ? new Date(visitData.visit_date).toLocaleDateString() : 'Unknown date';

    return {
      id: item.id,
      title: item.title || 'New Farm Visit Request',
      description: item.description || `${visitData?.name || 'Someone'} has requested a farm visit on ${visitDate}`,
      priority: item.priority || 'high',
      time: formatTimeAgo(item.created_at),
      type: getTypeIcon(item.priority || 'high'),
      icon: getFarmVisitIcon(),
      requestId: item.related_id,
      visitData: visitData
    };
  });
}

function transformRecentData(dbData) {
  console.log('Transforming recent data:', dbData);
  return dbData.map(item => {
    const visitData = item.farm_visit_requests;
    const visitDate = visitData ? new Date(visitData.visit_date).toLocaleDateString() : 'Unknown date';

    return {
      id: item.id,
      title: item.title || 'Farm Visit Request Processed',
      description: item.description || `${visitData?.name || 'Someone'} farm visit request for ${visitDate}`,
      priority: item.priority || 'medium',
      completedTime: formatTimeAgo(item.completed_at),
      completedBy: item.completed_by || 'Admin',
      action: item.action_taken,
      type: item.action_taken === 'accepted' ? 'success' : 'error',
      icon: getFarmVisitIcon(),
      visitData: visitData
    };
  });
}

// Helper functions
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

function getTypeIcon(priority) {
  switch (priority) {
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'info';
  }
}

function getFarmVisitIcon() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
}

// Export for global use
window.SupabaseAdmin = SupabaseAdmin;
window.transformPendingData = transformPendingData;
window.transformRecentData = transformRecentData;
