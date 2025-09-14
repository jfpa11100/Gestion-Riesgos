import { inject, Injectable } from '@angular/core';
import { Resend } from 'resend';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  sender!: Resend;
  supabaseService = inject(SupabaseService)

  async sendProjectInvitation(projectName: string, inviterName: string, memberEmail: string) {
    const { data, error } = await this.supabaseService.supabase.functions.invoke('resend-email', {
      // TODO: Pay a domain to send emails to another email account
      body: { name: 'Functions', projectName, inviterName, memberEmail:'felipepala1000@gmail.com' },
    })
    if (data.statusCode == 401) throw "Error"
    if (error) throw error
  }
}


