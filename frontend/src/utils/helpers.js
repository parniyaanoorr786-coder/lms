export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getRoleBadge = (role) => {
  switch (role) {
    case 'admin':
      return { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    case 'teacher':
      return { label: 'Teacher', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'student':
      return { label: 'Student', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    default:
      return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
    case 'published':
    case 'present':
    case 'graded':
      return { label: status, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'inactive':
    case 'draft':
    case 'absent':
    case 'dropped':
      return { label: status, color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'late':
    case 'on_leave':
      return { label: status, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'submitted':
    case 'excused':
      return { label: status, color: 'bg-blue-50 text-blue-700 border-blue-200' };
    default:
      return { label: status || 'unknown', color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};
