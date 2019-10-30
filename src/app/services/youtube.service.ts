import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {map, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';

import { Duration } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  private static seconds = 1;
  private static minutes = 2;
  private static hours = 3;

  static regExp = / /g; // Regular expression that returns blank spaces

  apiKey = 'AIzaSyBRS7oLeKhYh7Cm8K_T3Cw_lKvGD2rMAv0';
  endPoint = 'https://www.googleapis.com/youtube/v3/search';
  endPointDetails = 'https://www.googleapis.com/youtube/v3/videos';

  nextPageToken = '';

  constructor(private http: HttpClient) { }

  search(searchTerm: Observable<string>) {
    return searchTerm.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => this.getSearchResults(term))
    );
  }

  getSearchResults(searchTerm: string) {
    const url = `${this.endPoint}?part=snippet&maxResults=10&key=${this.apiKey}&q=${searchTerm}&type=video`;
    return this.getVideos(url);
  }

  nextPage(term: string) {
    const url = `${this.endPoint}?part=snippet&maxResults=10&pageToken=${this.nextPageToken}&key=${this.apiKey}&q=${term}&type=video`;
    return this.getVideos(url);
  }

  getVideos(url: string) {
    return this.http.get(url)
      .pipe(map( data => {
        this.nextPageToken = data['nextPageToken'];
        const videos = [];
        const dataItems = data['items'];
        for (const video of dataItems) {
          const videoObject = {
            id: video.id.videoId,
            snippet: video.snippet
          };

          videos.push(videoObject);
        }

        return videos;
      }));
  }

  getContentDetails(id: string) {
    const url = `${this.endPointDetails}?id=${id}&part=contentDetails&key=${this.apiKey}`;
    return this.http.get(url)
      .pipe(map( data => {
        const durationISO8601 = data['items'][0].contentDetails.duration;

        return YoutubeService.formatVideoDuration(durationISO8601);
      }));
  }

  static formatVideoDuration(durationISO: string) {
    const duration = Duration.fromISO(durationISO).toObject();
    let format;
    if (Object.keys(duration).length === this.seconds) { format = Duration.fromObject(duration).toFormat('m ss'); }
    if (Object.keys(duration).length === this.minutes) { format = Duration.fromObject(duration).toFormat('mm ss'); }
    if (Object.keys(duration).length === this.hours) { format = Duration.fromObject(duration).toFormat('h mm ss'); }

    return format.replace(this.regExp, ':');
  }

}
