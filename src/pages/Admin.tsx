import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Calendar, Settings, Plus, Edit2, Trash2, ArrowLeft, Save, Users, IndianRupee } from "lucide-react";
import logo from "@/assets/logo.jpeg";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string | null;
  location: string;
  featured: boolean;
  price: number | null;
  max_attendees: number | null;
}

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"events" | "settings">("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchEvents();
    fetchSettings();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("site_settings").select("*");

    if (!error && data) {
      setSettings(data);
      const settingsMap: Record<string, string> = {};
      data.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      setEditingSettings(settingsMap);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const priceValue = formData.get("price") as string;
    const maxAttendeesValue = formData.get("max_attendees") as string;

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time_start: formData.get("time_start") as string,
      time_end: formData.get("time_end") as string || null,
      location: formData.get("location") as string,
      featured: formData.get("featured") === "on",
      price: priceValue ? parseInt(priceValue) : null,
      max_attendees: maxAttendeesValue ? parseInt(maxAttendeesValue) : null,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        toast.error("Failed to update event");
      } else {
        toast.success("Event updated!");
        setEditingEvent(null);
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("events").insert(eventData);

      if (error) {
        toast.error("Failed to create event");
      } else {
        toast.success("Event created!");
        setShowEventForm(false);
        fetchEvents();
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete event");
    } else {
      toast.success("Event deleted");
      fetchEvents();
    }
  };

  const handleSaveSettings = async () => {
    for (const [key, value] of Object.entries(editingSettings)) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);

      if (error) {
        toast.error(`Failed to update ${key}`);
        return;
      }
    }
    toast.success("Settings saved!");
    fetchSettings();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-6" />
          <h1 className="font-display font-bold text-2xl text-secondary mb-4">
            Access Restricted
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the site owner to get admin access.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
            <span className="font-display font-bold text-lg text-secondary">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "events"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-secondary">
                Manage Events
              </h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>

            {/* Event Form */}
            {(showEventForm || editingEvent) && (
              <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">
                  {editingEvent ? "Edit Event" : "New Event"}
                </h3>
                <form onSubmit={handleSaveEvent} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        name="title"
                        defaultValue={editingEvent?.title || ""}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        name="location"
                        defaultValue={editingEvent?.location || ""}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingEvent?.description || ""}
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        name="date"
                        type="date"
                        defaultValue={editingEvent?.date || ""}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time</label>
                      <input
                        name="time_start"
                        type="time"
                        defaultValue={editingEvent?.time_start || ""}
                        required
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time</label>
                      <input
                        name="time_end"
                        type="time"
                        defaultValue={editingEvent?.time_end || ""}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Price (₹)
                      </label>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        defaultValue={editingEvent?.price || ""}
                        placeholder="Leave empty for free event"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Max Attendees
                      </label>
                      <input
                        name="max_attendees"
                        type="number"
                        min="1"
                        defaultValue={editingEvent?.max_attendees || ""}
                        placeholder="Leave empty for unlimited"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      name="featured"
                      type="checkbox"
                      defaultChecked={editingEvent?.featured || false}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">Featured event</label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      {editingEvent ? "Update Event" : "Create Event"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                      }}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-secondary">{event.title}</h3>
                      {event.featured && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          Featured
                        </span>
                      )}
                      {event.price && event.price > 0 ? (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                          ₹{event.price}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full">
                          Free
                        </span>
                      )}
                      {event.max_attendees && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                          Max: {event.max_attendees}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No events yet. Click "Add Event" to create one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <h2 className="font-display font-bold text-2xl text-secondary mb-6">
              Site Settings
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              {settings.length === 0 ? (
                <p className="text-muted-foreground">No settings configured yet.</p>
              ) : (
                settings.map((setting) => (
                  <div key={setting.id}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {setting.key.replace(/_/g, " ")}
                    </label>
                    {setting.key.includes("text") ||
                    setting.key.includes("subtitle") ||
                    setting.key.includes("quote") ||
                    setting.key.includes("description") ? (
                      <textarea
                        value={editingSettings[setting.key] || ""}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            [setting.key]: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editingSettings[setting.key] || ""}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            [setting.key]: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                    )}
                  </div>
                ))
              )}
              {settings.length > 0 && (
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
