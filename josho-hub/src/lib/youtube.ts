const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";
const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  url: string;
}

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function extractChannelIdOrHandle(url: string): { type: "channel" | "handle"; value: string } | null {
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]+)/);
  if (channelMatch) return { type: "channel", value: channelMatch[1] };

  const handleMatch = url.match(/youtube\.com\/@([\w.-]+)/);
  if (handleMatch) return { type: "handle", value: handleMatch[1] };

  return null;
}

export async function fetchChannelTopVideos(
  channelInput: string,
  maxVideos = 5
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  const parsed = extractChannelIdOrHandle(channelInput);
  if (!parsed) return [];

  let channelId: string;

  if (parsed.type === "channel") {
    channelId = parsed.value;
  } else {
    const res = await fetch(
      `${YOUTUBE_BASE}/channels?part=id&forHandle=${encodeURIComponent(parsed.value)}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    channelId = data.items?.[0]?.id;
    if (!channelId) return [];
  }

  const channelRes = await fetch(
    `${YOUTUBE_BASE}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  );
  const channelData = await channelRes.json();
  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  const playlistRes = await fetch(
    `${YOUTUBE_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxVideos}&key=${YOUTUBE_API_KEY}`
  );
  const playlistData = await playlistRes.json();
  const items = playlistData.items ?? [];

  return items.map((item: Record<string, unknown>) => {
    const snippet = item.snippet as Record<string, unknown>;
    const vid = (item.contentDetails as Record<string, unknown>)?.videoId as string;
    const thumb = (snippet?.thumbnails as Record<string, { url?: string }>)?.high?.url
      ?? (snippet?.thumbnails as Record<string, { url?: string }>)?.default?.url;
    return {
      id: vid,
      title: (snippet?.title as string) ?? "",
      thumbnail: thumb ?? null,
      url: `https://www.youtube.com/watch?v=${vid}`
    };
  });
}

export function parseYouTubeUrl(url: string): { type: "video" | "channel"; videoId?: string; channelInput?: string } | null {
  const videoId = extractVideoId(url);
  if (videoId) return { type: "video", videoId };

  const channel = extractChannelIdOrHandle(url);
  if (channel) return { type: "channel", channelInput: url };

  return null;
}
