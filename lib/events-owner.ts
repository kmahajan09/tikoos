/** Must match the uuid owner column on `public.events` and your RLS policies. */
export const EVENTS_OWNER_COLUMN =
  process.env.NEXT_PUBLIC_EVENTS_OWNER_COLUMN?.trim() || 'created_by'
