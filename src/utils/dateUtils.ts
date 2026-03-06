export interface UrgencyLevel {
  status: 'urgent' | 'closing-soon' | 'available';
  daysLeft: number;
  bgColor: string;
  textColor: string;
  label: string;
}

export function calculateUrgency(deadline?: string): UrgencyLevel {
  if (!deadline) {
    return {
      status: 'available',
      daysLeft: 9999,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      label: 'Open / Ongoing'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'urgent',
      daysLeft: 0,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      label: 'Closed'
    };
  } else if (daysLeft <= 7) {
    return {
      status: 'urgent',
      daysLeft,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      label: `${daysLeft} days left`
    };
  } else if (daysLeft <= 30) {
    return {
      status: 'closing-soon',
      daysLeft,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      label: `${daysLeft} days left`
    };
  } else {
    return {
      status: 'available',
      daysLeft,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      label: `${daysLeft} days left`
    };
  }
}

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
