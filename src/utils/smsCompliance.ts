export interface ComplianceCheck {
  allowed: boolean;
  reason?: string;
}

export function checkNYSMSCompliance(): ComplianceCheck {
  const now = new Date();

  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const hours = etDate.getHours();
  const dayOfWeek = etDate.getDay();

  if (dayOfWeek === 0) {
    return {
      allowed: false,
      reason: 'SMS messages cannot be sent on Sundays per New York regulations'
    };
  }

  if (hours < 9) {
    return {
      allowed: false,
      reason: `SMS messages cannot be sent before 9:00 AM ET (current time: ${hours}:${etDate.getMinutes().toString().padStart(2, '0')} AM ET)`
    };
  }

  if (hours >= 18) {
    return {
      allowed: false,
      reason: `SMS messages cannot be sent after 6:00 PM ET (current time: ${hours === 12 ? 12 : hours > 12 ? hours - 12 : hours}:${etDate.getMinutes().toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'} ET)`
    };
  }

  return { allowed: true };
}

export function getNextAllowedTime(): string {
  const now = new Date();
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const hours = etDate.getHours();
  const dayOfWeek = etDate.getDay();

  if (dayOfWeek === 0) {
    const tomorrow = new Date(etDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' ET';
  }

  if (hours < 9) {
    const today = new Date(etDate);
    today.setHours(9, 0, 0, 0);
    return today.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' ET';
  }

  if (hours >= 18) {
    const tomorrow = new Date(etDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' ET';
  }

  return 'now';
}

export function formatCurrentETTime(): string {
  const now = new Date();
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  return etDate.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' ET';
}
