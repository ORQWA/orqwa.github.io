// Screenshots come straight from the ORQWA repository (docs/images), linked in as
// ./orqwa-docs locally and checked out there in CI, so the site always shows the current app.
import type { ImageMetadata } from 'astro';

import fujiEvening from '../../orqwa-docs/images/showcase/fuji-lake-evening.jpg';
import furkaGroup from '../../orqwa-docs/images/showcase/alpenbrevet-furka-group-climb.jpg';
import wadaHairpins from '../../orqwa-docs/images/showcase/wada-hairpin-autumn-group.jpg';
import scheideggWinter from '../../orqwa-docs/images/showcase/grosse-scheidegg-winter-gradient.jpg';
import saimaaSunset from '../../orqwa-docs/images/showcase/saimaa-ridge-group-evening.jpg';
import saimaaRain from '../../orqwa-docs/images/showcase/saimaa-ridge-rain-group.jpg';
import nesqueGorge from '../../orqwa-docs/images/showcase/nesque-gorge-autumn-group.jpg';
import fujiSpring from '../../orqwa-docs/images/showcase/fuji-lake-spring-group.jpg';
import wadaEvening from '../../orqwa-docs/images/showcase/wada-autumn-evening.jpg';
import videoCourse from '../../orqwa-docs/images/readme/video-course.jpg';
import groupWindow from '../../orqwa-docs/images/groups/window.jpg';
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
import profile from '../../orqwa-docs/images/app/profile.png';
import lobby from '../../orqwa-docs/images/groups/lobby-en.png';

/** caption: a short highlight shown under the shot; alt: what the image shows, for screen readers. */
export interface Shot { src: ImageMetadata; alt: string; caption: string }

/** Riding: the showcase of saved courses (seasons, weather, times of day, alone and in groups), then the features around it. */
export const ridingShots: Shot[] = [
  { src: fujiEvening, alt: "Evening sun over the lake below Mount Fuji in ORQWA's 3D world", caption: 'Evening below Mount Fuji' },
  { src: furkaGroup, alt: 'Climbing the Furka with friends, with the HUD and the list of riders', caption: 'Group ride up the Furka' },
  { src: wadaHairpins, alt: 'A group riding autumn hairpins in Japan, seen from above', caption: 'Autumn hairpins from above' },
  { src: scheideggWinter, alt: 'Riding down through a snowy forest below the Wetterhorn, with the HUD, the dark map and the coloured elevation profile', caption: 'Snowy descent from the Grosse Scheidegg' },
  { src: saimaaSunset, alt: 'A group on the Saimaa lake ridge at sunset, seen from above', caption: 'Saimaa at sunset' },
  { src: saimaaRain, alt: 'Riding in the rain on the Saimaa ridge in a group ride, with the HUD', caption: 'Riding in the rain' },
  { src: nesqueGorge, alt: 'A group above the Gorges de la Nesque in autumn evening light', caption: 'Gorges de la Nesque' },
  { src: fujiSpring, alt: 'A group riding past cherry blossom along a lake below Mount Fuji', caption: 'Cherry blossom in spring' },
  { src: wadaEvening, alt: 'An autumn forest and a view over the hills at evening, in Japan', caption: 'Autumn forest at evening' },
  { src: overlay, alt: "ORQWA's ride figures in a compact overlay window", caption: 'Overlay on top of any window' },
  { src: videoCourse, alt: 'Riding a video course in ORQWA', caption: 'Video course' },
  { src: groupWindow, alt: 'The group ride window during a ride, with the invitation, the riders and their ping, voice chat and the group workout', caption: 'Group ride window' },
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
  { src: profile, alt: 'A rider profile with weight, FTP, power and heart-rate zones and connected accounts', caption: 'Rider profile' },
  { src: lobby, alt: 'The lobby of a group ride', caption: 'Group ride lobby' },
  { src: hudEditor, alt: 'Choosing the figures of the ride HUD', caption: 'HUD editor' },
];
