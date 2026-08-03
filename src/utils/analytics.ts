export type AnalyticsEventType = 
  | 'Wallet Connected'
  | 'Payment Triggered'
  | 'Payment Success'
  | 'Payment Failure'
  | 'Link Created'
  | 'Link Viewed';

export interface AnalyticsPayload {
  walletAddress?: string;
  linkId?: string;
  price?: number;
  token?: string;
  longUrl?: string;
  error?: string;
  network?: string;
  [key: string]: any; // Extensible fields
}

export interface AnalyticsRecord {
  id: string;
  eventName: AnalyticsEventType;
  properties: AnalyticsPayload;
  timestamp: number;
}

const ANALYTICS_STORAGE_KEY = 'stellar_paywall_analytics_v2';
const isBrowser = () => typeof window !== 'undefined';

class AnalyticsTracker {
  /**
   * Tracks structured telemetry events, logs to developer console,
   * and persists events in localStorage. Swappable with external analytics.
   */
  track(eventName: AnalyticsEventType, properties: AnalyticsPayload = {}): void {
    if (!isBrowser()) return;

    const record: AnalyticsRecord = {
      id: Math.random().toString(36).substring(2, 9),
      eventName,
      properties,
      timestamp: Date.now()
    };

    // 1. Stylized console log for developer audits
    const styles = {
      'Wallet Connected': 'color: #06b6d4; font-weight: bold;',
      'Payment Triggered': 'color: #3b82f6; font-weight: bold;',
      'Payment Success': 'color: #10b981; font-weight: bold;',
      'Payment Failure': 'color: #ef4444; font-weight: bold;',
      'Link Created': 'color: #a855f7; font-weight: bold;',
      'Link Viewed': 'color: #f43f5e; font-weight: bold;'
    };

    console.log(
      `%c[Telemetry Log] ${eventName}`, 
      styles[eventName] || 'color: #94a3b8; font-weight: bold;', 
      properties
    );

    // 2. Persist locally to localStorage (limited to latest 100 entries)
    try {
      const existing = this.getEvents();
      existing.unshift(record);
      window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
    } catch (e) {
      console.error('Analytics: Error writing event log:', e);
    }

    // 3. SEGMENT / POSTHOG INTEGRATION HOOK
    // To connect external analytics, simply uncomment and initialize:
    /*
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.posthog) window.posthog.capture(eventName, properties);
      // @ts-ignore
      if (window.analytics) window.analytics.track(eventName, properties);
    }
    */
  }

  getEvents(): AnalyticsRecord[] {
    if (!isBrowser()) return [];
    const data = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Analytics: Error reading event log:', e);
      return [];
    }
  }

  clearEvents(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }

  exportToCSV(events: AnalyticsRecord[]): void {
    if (!isBrowser() || events.length === 0) return;
    
    const headers = ["Event ID", "Event Name", "Timestamp", "Date Time", "Wallet Address", "Link ID", "Price", "Token", "Long URL", "Error"];
    const rows = events.map(evt => {
      const dateStr = new Date(evt.timestamp).toISOString();
      const p = evt.properties || {};
      return [
        evt.id,
        evt.eventName,
        evt.timestamp,
        dateStr,
        p.walletAddress || "",
        p.linkId || "",
        p.price !== undefined ? p.price : "",
        p.token || "",
        p.longUrl ? `"${p.longUrl.replace(/"/g, '""')}"` : "",
        p.error ? `"${p.error.replace(/"/g, '""')}"` : ""
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stellar_paywall_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const analytics = new AnalyticsTracker();
