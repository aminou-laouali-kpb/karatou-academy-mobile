// Généré par « supabase gen types typescript » (npm run db:types). Ne pas modifier à la main.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_uid: string
          expires_at: string
          granted_by_org_id: string | null
          id: string
          issued_at: string | null
          module_id: string | null
          pdf_url: string | null
          qr_code_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          certificate_uid: string
          expires_at: string
          granted_by_org_id?: string | null
          id?: string
          issued_at?: string | null
          module_id?: string | null
          pdf_url?: string | null
          qr_code_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_uid?: string
          expires_at?: string
          granted_by_org_id?: string | null
          id?: string
          issued_at?: string | null
          module_id?: string | null
          pdf_url?: string | null
          qr_code_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_granted_by_org_id_fkey"
            columns: ["granted_by_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["block_type"]
          content_en: Json | null
          content_fr: Json | null
          content_ha: Json | null
          course_id: string | null
          created_at: string | null
          id: string
          order_index: number
        }
        Insert: {
          block_type: Database["public"]["Enums"]["block_type"]
          content_en?: Json | null
          content_fr?: Json | null
          content_ha?: Json | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
        }
        Update: {
          block_type?: Database["public"]["Enums"]["block_type"]
          content_en?: Json | null
          content_fr?: Json | null
          content_ha?: Json | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_videos: {
        Row: {
          course_id: string | null
          duration_seconds: number | null
          id: string
          language: string | null
          provider: string | null
          thumbnail_url: string | null
          video_url: string
        }
        Insert: {
          course_id?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          provider?: string | null
          thumbnail_url?: string | null
          video_url: string
        }
        Update: {
          course_id?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          provider?: string | null
          thumbnail_url?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_videos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          module_id: string | null
          order_index: number
          slug: string
          title_en: string | null
          title_fr: string
          title_ha: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          module_id?: string | null
          order_index?: number
          slug: string
          title_en?: string | null
          title_fr: string
          title_ha?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          module_id?: string | null
          order_index?: number
          slug?: string
          title_en?: string | null
          title_fr?: string
          title_ha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary_terms: {
        Row: {
          created_at: string | null
          definition_en: string | null
          definition_fr: string
          definition_ha: string | null
          id: string
          module_id: string | null
          term_en: string | null
          term_fr: string
          term_ha: string | null
        }
        Insert: {
          created_at?: string | null
          definition_en?: string | null
          definition_fr: string
          definition_ha?: string | null
          id?: string
          module_id?: string | null
          term_en?: string | null
          term_fr: string
          term_ha?: string | null
        }
        Update: {
          created_at?: string | null
          definition_en?: string | null
          definition_fr?: string
          definition_ha?: string | null
          id?: string
          module_id?: string | null
          term_en?: string | null
          term_fr?: string
          term_ha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glossary_terms_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      karatou_attestation_signing_policy: {
        Row: {
          active_key_id: string
          id: boolean
        }
        Insert: {
          active_key_id?: string
          id?: boolean
        }
        Update: {
          active_key_id?: string
          id?: boolean
        }
        Relationships: []
      }
      karatou_attestations: {
        Row: {
          expires_at: string
          id: string
          issued_at: string
          issued_by: string
          issued_on: string
          recipient_name: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          signature: string
          signing_key_id: string
          status: string
        }
        Insert: {
          expires_at: string
          id: string
          issued_at: string
          issued_by: string
          issued_on?: string
          recipient_name: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature: string
          signing_key_id?: string
          status?: string
        }
        Update: {
          expires_at?: string
          id?: string
          issued_at?: string
          issued_by?: string
          issued_on?: string
          recipient_name?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature?: string
          signing_key_id?: string
          status?: string
        }
        Relationships: []
      }
      karatou_certificates: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          issued_at: string
          module_name: string
          module_slug: string
          status: string
          uid: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          issued_at?: string
          module_name: string
          module_slug: string
          status?: string
          uid: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          issued_at?: string
          module_name?: string
          module_slug?: string
          status?: string
          uid?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      karatou_content_imports: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          file_type: string
          id: string
          message: string
          status: string
          storage_path: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          file_type: string
          id?: string
          message?: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_type?: string
          id?: string
          message?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: []
      }
      karatou_courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          duration: string
          id: string
          lesson_content: Json | null
          module_id: string
          status: string
          title: string
          translations: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          duration?: string
          id?: string
          lesson_content?: Json | null
          module_id: string
          status?: string
          title: string
          translations?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          duration?: string
          id?: string
          lesson_content?: Json | null
          module_id?: string
          status?: string
          title?: string
          translations?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "karatou_courses_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "karatou_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      karatou_enterprise_members: {
        Row: {
          certificate_uid: string | null
          certificates: number
          created_at: string
          created_by: string | null
          email: string
          id: string
          last_activity: string
          name: string
          organization_id: string
          progress: number
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          certificate_uid?: string | null
          certificates?: number
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          last_activity?: string
          name: string
          organization_id: string
          progress?: number
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          certificate_uid?: string | null
          certificates?: number
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          last_activity?: string
          name?: string
          organization_id?: string
          progress?: number
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "karatou_enterprise_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "karatou_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      karatou_learner_progress: {
        Row: {
          completed_at: string
          course_id: string
          module_slug: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          module_slug: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          module_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      karatou_legacy_attestations: {
        Row: {
          expires_at: string
          id: string
          imported_at: string
          issued_at: string
          recipient_name: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          signature: string
          source_sha256: string
          status: string
        }
        Insert: {
          expires_at: string
          id: string
          imported_at?: string
          issued_at: string
          recipient_name: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature: string
          source_sha256: string
          status?: string
        }
        Update: {
          expires_at?: string
          id?: string
          imported_at?: string
          issued_at?: string
          recipient_name?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature?: string
          source_sha256?: string
          status?: string
        }
        Relationships: []
      }
      karatou_modules: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          duration: string
          emoji: string
          enrolled: number
          id: string
          intro_video: Json
          is_free: boolean
          level: string
          rating: number
          rubrique_id: string | null
          slug: string
          status: string
          subtitle: string
          title: string
          translations: Json
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          duration?: string
          emoji?: string
          enrolled?: number
          id?: string
          intro_video?: Json
          is_free?: boolean
          level?: string
          rating?: number
          rubrique_id?: string | null
          slug: string
          status?: string
          subtitle?: string
          title: string
          translations?: Json
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          duration?: string
          emoji?: string
          enrolled?: number
          id?: string
          intro_video?: Json
          is_free?: boolean
          level?: string
          rating?: number
          rubrique_id?: string | null
          slug?: string
          status?: string
          subtitle?: string
          title?: string
          translations?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "karatou_modules_rubrique_id_fkey"
            columns: ["rubrique_id"]
            isOneToOne: false
            referencedRelation: "karatou_rubriques"
            referencedColumns: ["id"]
          },
        ]
      }
      karatou_org_memberships: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          organization_id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          organization_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          organization_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "karatou_org_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "karatou_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      karatou_organizations: {
        Row: {
          country: string
          created_at: string
          created_by: string | null
          id: string
          industry: string
          logo_url: string | null
          name: string
          plan: string
          seats_total: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string
          logo_url?: string | null
          name: string
          plan?: string
          seats_total?: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string
          logo_url?: string | null
          name?: string
          plan?: string
          seats_total?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      karatou_rubriques: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          icon: string
          id: string
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          icon?: string
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          icon?: string
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      karatou_scholarships: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          claimed_by_email: string | null
          claimed_by_user_id: string | null
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          expires_at_date: string
          id: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          claimed_by_email?: string | null
          claimed_by_user_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          expires_at_date?: string
          id?: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          claimed_by_email?: string | null
          claimed_by_user_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          expires_at_date?: string
          id?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "karatou_scholarships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "karatou_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          description_ha: string | null
          id: string
          is_free_preview: boolean | null
          is_published: boolean | null
          order_index: number
          slug: string
          thumbnail_url: string | null
          title_en: string | null
          title_fr: string
          title_ha: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_ha?: string | null
          id?: string
          is_free_preview?: boolean | null
          is_published?: boolean | null
          order_index?: number
          slug: string
          thumbnail_url?: string | null
          title_en?: string | null
          title_fr: string
          title_ha?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_ha?: string | null
          id?: string
          is_free_preview?: boolean | null
          is_published?: boolean | null
          order_index?: number
          slug?: string
          thumbnail_url?: string | null
          title_en?: string | null
          title_fr?: string
          title_ha?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          source?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_order_id: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_order_id?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_order_id?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          org_id: string | null
          role: string | null
          status: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          org_id?: string | null
          role?: string | null
          status?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          org_id?: string | null
          role?: string | null
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          id: string
          joined_at: string | null
          org_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          org_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          org_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          seats_total: number | null
          seats_used: number | null
          size_range: string | null
          slug: string
          subscription_expires_at: string | null
          subscription_plan: string | null
          website: string | null
        }
        Insert: {
          contact_email: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          seats_total?: number | null
          seats_used?: number | null
          size_range?: string | null
          slug: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          seats_total?: number | null
          seats_used?: number | null
          size_range?: string | null
          slug?: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_range: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          region: string | null
          role: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          region?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          region?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          block_id: string | null
          correct_index: number
          explanation_en: string | null
          explanation_fr: string | null
          explanation_ha: string | null
          id: string
          options_en: Json | null
          options_fr: Json
          options_ha: Json | null
          order_index: number | null
          question_en: string | null
          question_fr: string
          question_ha: string | null
        }
        Insert: {
          block_id?: string | null
          correct_index: number
          explanation_en?: string | null
          explanation_fr?: string | null
          explanation_ha?: string | null
          id?: string
          options_en?: Json | null
          options_fr: Json
          options_ha?: Json | null
          order_index?: number | null
          question_en?: string | null
          question_fr: string
          question_ha?: string | null
        }
        Update: {
          block_id?: string | null
          correct_index?: number
          explanation_en?: string | null
          explanation_fr?: string | null
          explanation_ha?: string | null
          id?: string
          options_en?: Json | null
          options_fr?: Json
          options_ha?: Json | null
          order_index?: number | null
          question_en?: string | null
          question_fr?: string
          question_ha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "content_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      renewal_notifications: {
        Row: {
          certificate_id: string | null
          id: string
          notification_type: string | null
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          certificate_id?: string | null
          id?: string
          notification_type?: string | null
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_id?: string | null
          id?: string
          notification_type?: string | null
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renewal_notifications_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificate_status_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_notifications_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renewal_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          batch_name: string | null
          claimed_by: string | null
          code: string
          created_at: string | null
          created_by: string | null
          email_sent_to: string | null
          expires_at: string | null
          id: string
          label: string | null
          module_id: string | null
          org_id: string | null
          status: string | null
        }
        Insert: {
          batch_name?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          email_sent_to?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          module_id?: string | null
          org_id?: string | null
          status?: string | null
        }
        Update: {
          batch_name?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          email_sent_to?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          module_id?: string | null
          org_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string | null
          status: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          course_id: string | null
          id: string
          last_block_index: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          id?: string
          last_block_index?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          id?: string
          last_block_index?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_answers: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean
          question_id: string | null
          selected_index: number
          user_id: string | null
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct: boolean
          question_id?: string | null
          selected_index: number
          user_id?: string | null
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string | null
          selected_index?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reflections: {
        Row: {
          block_id: string | null
          content: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          block_id?: string | null
          content: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          block_id?: string | null
          content?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reflections_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "content_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vsg_brand_profiles: {
        Row: {
          audience: string | null
          created_at: string
          example_scripts: string | null
          id: string
          name: string
          niche: string | null
          style_notes: string | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          example_scripts?: string | null
          id?: string
          name: string
          niche?: string | null
          style_notes?: string | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          example_scripts?: string | null
          id?: string
          name?: string
          niche?: string | null
          style_notes?: string | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vsg_extractions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          platform: string
          source_url: string
          title: string | null
          transcript: string | null
          transcript_source: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          platform: string
          source_url: string
          title?: string | null
          transcript?: string | null
          transcript_source?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          platform?: string
          source_url?: string
          title?: string | null
          transcript?: string | null
          transcript_source?: string | null
        }
        Relationships: []
      }
      vsg_generations: {
        Row: {
          brand_profile_id: string | null
          created_at: string
          extra_instructions: string | null
          extraction_id: string | null
          id: string
          model: string | null
          output_script: string
          provider: string
        }
        Insert: {
          brand_profile_id?: string | null
          created_at?: string
          extra_instructions?: string | null
          extraction_id?: string | null
          id?: string
          model?: string | null
          output_script: string
          provider: string
        }
        Update: {
          brand_profile_id?: string | null
          created_at?: string
          extra_instructions?: string | null
          extraction_id?: string | null
          id?: string
          model?: string | null
          output_script?: string
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsg_generations_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "vsg_brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsg_generations_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "vsg_extractions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      certificate_status_view: {
        Row: {
          certificate_uid: string | null
          computed_status: string | null
          days_until_expiry: number | null
          email: string | null
          expires_at: string | null
          full_name: string | null
          granted_by_org_id: string | null
          id: string | null
          issued_at: string | null
          module_id: string | null
          module_title_en: string | null
          module_title_fr: string | null
          module_title_ha: string | null
          pdf_url: string | null
          preferred_language: string | null
          qr_code_url: string | null
          status: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_granted_by_org_id_fkey"
            columns: ["granted_by_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_member_progress_view: {
        Row: {
          certificates_active: number | null
          certificates_expired: number | null
          courses_completed: number | null
          full_name: string | null
          last_activity_at: string | null
          member_role: string | null
          org_id: string | null
          preferred_language: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      karatou_attestation_registry_snapshot: { Args: never; Returns: Json }
      karatou_get_learner_home: { Args: never; Returns: Json }
      karatou_get_league: { Args: never; Returns: Json }
      karatou_get_org_leaderboard: { Args: { org_id: string }; Returns: Json }
      karatou_get_streak_calendar: {
        Args: { month: string }
        Returns: {
          active: boolean
          day: string
          frozen: boolean
          xp: number
        }[]
      }
      karatou_record_lesson_attempt: { Args: { payload: Json }; Returns: Json }
      karatou_record_review: { Args: { results: Json }; Returns: Json }
      karatou_revoke_certificate: { Args: { input_uid: string }; Returns: string }
      karatou_submit_quiz: {
        Args: {
          input_answers: string[]
          input_completed_at?: string
          input_course_id: string
          input_lang: string
          input_module_slug: string
        }
        Returns: {
          correct: number
          status: string
          total: number
        }[]
      }
      karatou_update_learning_prefs: { Args: { prefs: Json }; Returns: Json }
      karatou_create_scholarship: {
        Args: { input_organization_id: string }
        Returns: {
          claimed_at: string | null
          claimed_by: string | null
          claimed_by_email: string | null
          claimed_by_user_id: string | null
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          expires_at_date: string
          id: string
          organization_id: string
          status: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "karatou_scholarships"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      karatou_issue_certificate: {
        Args: { input_module_slug: string }
        Returns: {
          expires_at: string
          id: string
          issued_at: string
          module_name: string
          module_slug: string
          status: string
          uid: string
          user_id: string
          user_name: string
        }[]
      }
      karatou_org_member_stats: {
        Args: { input_organization_id: string }
        Returns: {
          certificate_uid: string
          certificates: number
          last_activity_at: string
          member_id: string
          progress: number
          status: string
        }[]
      }
      karatou_public_impact_stats: {
        Args: never
        Returns: {
          by_country: Json
          by_gender: Json
          by_region: Json
          certificates: number
          countries: number
          learners: number
          regions: number
        }[]
      }
      karatou_redeem_scholarship: {
        Args: { input_code: string }
        Returns: {
          message: string
          organization_id: string
          organization_name: string
          result: string
          scholarship_code: string
        }[]
      }
      karatou_verify_certificate: {
        Args: { input_uid: string }
        Returns: {
          expires_at: string
          id: string
          issued_at: string
          module_name: string
          module_slug: string
          status: string
          uid: string
          user_name: string
        }[]
      }
      update_expired_certificates: { Args: never; Returns: undefined }
    }
    Enums: {
      block_type:
        | "objective"
        | "video"
        | "text"
        | "example"
        | "practice"
        | "quiz"
        | "reflection"
        | "glossary_highlight"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      block_type: [
        "objective",
        "video",
        "text",
        "example",
        "practice",
        "quiz",
        "reflection",
        "glossary_highlight",
      ],
    },
  },
} as const
