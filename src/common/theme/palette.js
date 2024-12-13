import {
	grey,
	green,
	indigo,
	lightGreen,
	deepOrange,
	blueGrey,
	red,
	blue,
	//#1877F2
} from '@mui/material/colors';
const validatedColor = (color) =>
	/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null;

export default (server, darkMode) => ({
	// mode: darkMode ? 'dark' : 'light',
		mode: darkMode ? 'light' : 'light',
	background: {
		// default: darkMode ? blueGrey[900] : blueGrey[50],
		default: darkMode ? '#F9FAFA' : '#F9FAFA',
	},
	primary: {
		main:
			validatedColor(server?.attributes?.colorPrimary) ||
			// (darkMode ? deepOrange[200] : '#1877F2'),
			(darkMode ? '#1877F2' : '#1877F2'),
	},
	secondary: {
		main:
			validatedColor(server?.attributes?.colorSecondary) ||
			(darkMode ? '#1b5e20' : green[900]),
	},
	neutral: {
		main: blueGrey[500],
	},
	geometry: {
		main: '#ff781f',
	},
});
