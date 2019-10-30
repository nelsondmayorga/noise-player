import {Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import { YoutubeService } from './services/youtube.service';

import {Subject} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private YT: any;
  private initialVideoId = 'DQls48KEKi4';
  private player: any;

  private index = 0;
  private listVideos = [];
  private domListIdVideos: any;
  private searchResults = [];
  private currentVideo = {id: null, snippet: {title: 'Noise player'}};
  private showModal = false;
  private onPause = true;

  private search = new FormControl('');

  private searchTerm$ = new Subject<string>();

  constructor(public youtubeService: YoutubeService) {

    this.youtubeService.search(this.searchTerm$)
      .subscribe(listResults => {
        this.searchResults = listResults;
      });
  }

  ngOnInit() {
    this.loadYoutubeApi();
    this.loadYoutubeIframePlayer();
    this.loadLocalStorage();
  }

  loadYoutubeApi() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  loadYoutubeIframePlayer() {
    window['onYouTubeIframeAPIReady'] = (e) => {
      this.YT = window['YT'];
      this.player = new window['YT'].Player('player', {
        videoId: this.initialVideoId,
        events: {
          onStateChange: this.onStateChange.bind(this),
          onError: this.onPlayerError.bind(this),
        }
      });
    };
  }

  onStateChange(e) {

    if (e.data === 0) {
      const newIndex = this.listVideos.findIndex(video => video.id === this.currentVideo.id);

      this.index = newIndex + 1;
      this.playVideo();
      this.changeVideoTitleOnPlayer();
      this.changeActiveVideoOnList();
    }
  }

  changeVideoTitleOnPlayer() {
    document.getElementById('title').innerText = this.currentVideo.snippet.title;
  }

  changeActiveVideoOnList() {
    this.domListIdVideos = document.querySelectorAll('.list-videos');
    this.domListIdVideos[this.index].classList.add('current-video');
    this.domListIdVideos[this.index - 1].classList.remove('current-video');
  }

  addToList(video: object) {
    this.listVideos.push(video);
    this.getContentDetails(video['id']);
  }

  getContentDetails(id: string) {
    this.youtubeService.getContentDetails(id).subscribe(data => {
      this.listVideos.map((video, index) => {
        if (video.id === id) { this.listVideos[index].duration = data; }
      });
      this.saveLocalStorage();
    });
  }

  playVideo() {
    if (this.listVideos[this.index]) {
      this.player.loadVideoById(this.listVideos[this.index].id);
      this.onPause = false;
      this.currentVideo = this.listVideos[this.index];
    }
  }

  playVideoFromList(index: number) {
    this.index = index;
    this.playVideo();
  }

  pauseVideo() {
    this.player.pauseVideo();
    this.onPause = true;
  }

  playPausedVideo() {
    this.player.playVideo();
    this.onPause = false;
  }

  nextVideo() {
    this.index++;
    if (this.index > this.listVideos.length - 1) {
      this.index = this.listVideos.length - 1;
      this.playVideo();
    } else {
      this.playVideo();
    }
  }

  previousVideo() {
    this.index--;
    if (this.index < 0) {
      this.index = 0;
      this.playVideo();
    } else {
      this.playVideo();
    }
  }

  deleteVideo(index: number) {
    this.listVideos.splice(index, 1);
    this.saveLocalStorage();
  }

  nextPage() {
    this.youtubeService.nextPage(this.search.value).subscribe(items => {
      items.map(item => {
        this.searchResults.push(item);
      });
    });
  }

  onPlayerError(event) {
    console.log('Player error', event.data);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.listVideos, event.previousIndex, event.currentIndex);
    this.saveLocalStorage();
  }

  keyUp(value: string) {
    const searchTerm = value.trim();
    if (searchTerm.length > 0) {
      this.searchTerm$.next(searchTerm);
    } else {
      this.searchResults = [];
    }
  }

  openDropDown() {
    this.showModal = true;
    setTimeout(function() {
      document.getElementById('search').focus();
    }, 100);
  }

  closeDropDown() {
    this.showModal = false;
  }

  saveLocalStorage() {
    localStorage.setItem('data', JSON.stringify(this.listVideos));
  }

  loadLocalStorage() {
    if (localStorage.getItem('data')) { this.listVideos = JSON.parse(localStorage.getItem('data')); }
  }


}
