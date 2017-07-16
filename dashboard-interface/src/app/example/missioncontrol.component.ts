import { Component } from '@angular/core';

import { MissionService } from './mission.service';

@Component({
	selector: 'mission-control',
	template: `
		<h2>Mission Control</h2>
		<button (click)="announce()">Announce mission</button>
		<h3>History</h3>
		<ul>
			<li *ngFor="let event of history">{{event}}</li>
		</ul>
	`
})

export class MissionControlComponent {
	history: string[] = [];
	missions = [
		'Fly to the moon!',
		'Fly to mars!',
		'Fly to Vegas!'];
	nextMission = 0;

	constructor(private _missionService: MissionService) {
		_missionService.missionConfirmed$.subscribe(
			astronaut => {
				this.history.push(`${astronaut} confirmed the mission`);
			});
	}

	announce() {
		let mission = this.missions[this.nextMission++];
		this._missionService.announceMission(mission);
		this.history.push(`Mission "${mission}" announced`);
		if (this.nextMission >= this.missions.length) { this.nextMission = 0; }
	}
}
