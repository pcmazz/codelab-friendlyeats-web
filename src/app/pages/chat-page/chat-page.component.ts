import { AsyncPipe } from '@angular/common';
import {Component, inject, OnInit} from '@angular/core'
import { DocumentData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
  standalone: true,
  imports: [AsyncPipe, FormsModule]
})
export class ChatPageComponent implements OnInit{
  chatService = inject(ChatService);
  messages$ = this.chatService.loadMessages() as Observable<DocumentData[]>;
  user$ = this.chatService.user$;
  text = '';

  constructor(){
    console.log('ChatPageComponent - constructor - CUNT')
  }

  async ngOnInit(): Promise<void>{
    console.log('ChatPageComponent - ngOnInit - CUNT')
    await this.chatService.saveMessagingDeviceToken()
  }



  sendTextMessage() {
    this.chatService.saveTextMessage(this.text).then(ref => {
      console.log('ChatPageComponent - sendTextMessage - ref = ', ref)
    });
    this.text = '';
  }

  uploadImage(event: any) {
    const imgFile: File = event.target.files[0];
    if (!imgFile) {
      return;
    }
    this.chatService.saveImageMessage(imgFile).then();
  }
}
