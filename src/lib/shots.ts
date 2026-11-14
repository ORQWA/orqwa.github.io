// Screenshots come straight from the ORQWA repository (docs/images), linked in as
// ./orqwa-docs locally and checked out there in CI, so the site always shows the current app.
import type { ImageMetadata } from 'astro';

import rideOverview from '../../orqwa-docs/images/app/ride-overview.jpg';
import rideFirstPerson from '../../orqwa-docs/images/app/ride-first-person.jpg';
import rideLake from '../../orqwa-docs/images/ride-lake.jpg';
import videoCourse from '../../orqwa-docs/images/readme/video-course.jpg';
import groupRiders from '../../orqwa-docs/images/groups/riders.jpg';
import overlay from '../../orqwa-docs/images/readme/overlay.jpg';

import courses from '../../orqwa-docs/images/app/courses.png';
import course from '../../orqwa-docs/images/app/course.png';
import workouts from '../../orqwa-docs/images/workouts/tab.png';
import workoutEditor from '../../orqwa-docs/images/workouts/editor.png';
import hudEditor from '../../orqwa-docs/images/hud-layouts/ride-en.png';
import summary from '../../orqwa-docs/images/app/summary.png';
import history from '../../orqwa-docs/images/app/history.png';
import analysis from '../../orqwa-docs/images/app/analysis.png';
import fitness from '../../orqwa-docs/images/app/analysis-fitness.png';
import devices from '../../orqwa-docs/images/app/devices.png';
import lobby from '../../orqwa-docs/images/groups/lobby-en.png';

/** caption: a short highlight shown under the shot; alt: what the image shows, for screen readers. */
export interface Shot { src: ImageMetadata; alt: string; caption: string }

/** Riding: the 3D world, video courses and the ride figures (HUD). */
export const ridingShots: Shot[] = [
  { src: rideOverview, alt: "Riding up from Twann in ORQWA's 3D world, with power, grade, minimap and the climb ahead", caption: 'Drone view' },
  { src: rideFirstPerson, alt: 'Climbing above Twann seen from the rider, with power, heart rate, minimap and elevation', caption: 'First-person view' },
  { src: rideLake, alt: "Riding along the Bielersee in ORQWA's 3D world", caption: 'Third-person view' },
  { src: overlay, alt: "ORQWA's ride figures in a compact overlay window", caption: 'Overlay on top of any window' },
  { src: videoCourse, alt: 'Riding a video course in ORQWA', caption: 'Video course' },
  { src: groupRiders, alt: 'Riders in a group ride, seen from behind', caption: 'Group ride with friends' },
];

/** The app around the ride, as the usage wiki shows it. */
export const appShots: Shot[] = [
  { src: courses, alt: 'The Courses tab with the Twann – Chasseral sample course', caption: 'Offline course library' },
  { src: course, alt: 'A course page with its map, climbs and ride options', caption: 'Course detail' },
  { src: workouts, alt: 'The Workouts tab', caption: 'Workout selection' },
  { src: workoutEditor, alt: 'The workout editor', caption: 'Workout builder' },
  { src: summary, alt: 'The summary after a ride', caption: 'Ride summary' },
  { src: history, alt: 'The ride history', caption: 'Ride history' },
  { src: analysis, alt: 'Analysis with the power curve and power profile', caption: 'Power curve and profile' },
  { src: fitness, alt: 'Analysis of fitness, fatigue and form', caption: 'Fitness, fatigue and form' },
  { src: devices, alt: 'Connecting a trainer and sensors under Devices', caption: 'Trainer and sensor setup' },
  { src: lobby, alt: 'The lobby of a group ride', caption: 'Group ride lobby' },
  { src: hudEditor, alt: 'Choosing the figures of the ride HUD', caption: 'HUD editor' },
];
