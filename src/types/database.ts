export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          room_type: 'free-participation' | 'assigned-book'
          book_title: string | null
          password_hash: string | null
          created_at: string
          expires_at: string
          current_mode: 'impression' | 'chat'
        }
        Insert: {
          id?: string
          name: string
          room_type: 'free-participation' | 'assigned-book'
          book_title?: string | null
          password_hash?: string | null
          created_at?: string
          expires_at: string
          current_mode?: 'impression' | 'chat'
        }
        Update: {
          id?: string
          name?: string
          room_type?: 'free-participation' | 'assigned-book'
          book_title?: string | null
          password_hash?: string | null
          created_at?: string
          expires_at?: string
          current_mode?: 'impression' | 'chat'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}