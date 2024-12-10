import React from "react";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
// import StarIcon from "@mui/icons-material/Star";
import StarRateTwoToneIcon from '@mui/icons-material/StarRateTwoTone';
// import TimelineIcon from "@mui/icons-material/Timeline";
import RouteTwoToneIcon from '@mui/icons-material/RouteTwoTone';
// import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import PauseCircleFilledTwoToneIcon from '@mui/icons-material/PauseCircleFilledTwoTone';
// import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PlayCircleFilledTwoToneIcon from '@mui/icons-material/PlayCircleFilledTwoTone';
// import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
// import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import StorageTwoToneIcon from '@mui/icons-material/StorageTwoTone';
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
// import RouteIcon from "@mui/icons-material/Route";
// import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import EventRepeatTwoToneIcon from '@mui/icons-material/EventRepeatTwoTone';
import NotesIcon from "@mui/icons-material/Notes";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../../common/components/LocalizationProvider";
import {
  useAdministrator,
  useRestriction,
} from "../../common/util/permissions";

// const MenuItem = ({ title, link, icon, selected }) => (
//   <ListItemButton key={link} component={Link} to={link} selected={selected}>
//     <ListItemIcon>{icon}</ListItemIcon>
//     <ListItemText primary={title} />
//   </ListItemButton>
// );

// const MenuItem = ({ title, link, icon, selected }) => (
//   <ListItemButton key={link} component={Link} to={link} selected={selected}>
//     <ListItemIcon>{icon}</ListItemIcon>
//     <ListItemText primary={title} />
//   </ListItemButton>
// );
const MenuItem = ({
  title, link, icon, selected,
}) => (
  <ListItemButton disableGutters key={link} component={Link} to={link}
    sx={{
      pl: 2,
      py: 1.5,
      gap: 2,
      pr: 1.5,
      m:1.3,
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#637381',
      bgcolor: "#fff",
      '&:hover': { bgcolor: '#F6F7F9', color: '#637381', },
      ...(selected && {
        fontWeight: 'bold',
        bgcolor: '#1877F214',
        color: '#71a0de',
        '&:hover': {
          bgcolor: '#cbdff7',
        },
      }),
    }}
  >
    <Box component="span" sx={{ width: 24, height: 24 }}>
      {icon}
    </Box>
    <Box component="span" flexGrow={1}>
      {title}
    </Box>
    {/* <ListItemIcon
     sx={{ color: selected ? '#637381' : 'text.primary'  }}
     >{icon}</ListItemIcon>
    <ListItemText primary={<Typography variant="subtitle1" color="#637381" >{title} </Typography> } 
    /> */}
     </ListItemButton>
);

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();
  const admin = useAdministrator();
  const readonly = useRestriction("readonly");

  return (
    <>
      <List sx={{ fontFamily: '"DM Sans Variable", "apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' }}>
        <MenuItem
          title={t("reportCombined")}
          link="/reports/combined"
          // icon={<StarIcon />}
          icon={<StarRateTwoToneIcon />}
          selected={location.pathname === "/reports/combined"}
        />
        <MenuItem
          title={t("reportRoute")}
          link="/reports/route"
          // icon={<TimelineIcon />}
          icon={<RouteTwoToneIcon />}
          selected={location.pathname === "/reports/route"}
        />
        <MenuItem
          title={t("reportEvents")}
          link="/reports/event"
          // icon={<NotificationsActiveIcon />}
          icon={<NotificationsActiveTwoToneIcon />}
          selected={location.pathname === "/reports/event"}
        />
        <MenuItem
          title={t("reportTrips")}
          link="/reports/trip"
          // icon={<PlayCircleFilledIcon />}
          icon={<PlayCircleFilledTwoToneIcon />}
          selected={location.pathname === "/reports/trip"}
        />
        <MenuItem
          title={t("reportStops")}
          link="/reports/stop"
          // icon={<PauseCircleFilledIcon />}
          icon={<PauseCircleFilledTwoToneIcon />}
          selected={location.pathname === "/reports/stop"}
        />
        <MenuItem
          title={t("reportSummary")}
          link="/reports/summary"
          // icon={<FormatListBulletedIcon />}
          icon={<StorageTwoToneIcon />}
          selected={location.pathname === "/reports/summary"}
        />
        <MenuItem
          title={t("reportChart")}
          link="/reports/chart"
          icon={<TrendingUpIcon />}
          selected={location.pathname === "/reports/chart"}
        />
        <MenuItem
          title={t("reportReplay")}
          link="/replay"
          // icon={<RouteIcon />}
          icon={<RouteTwoToneIcon />}
        />
      </List>
      <Divider />
      <List>
        <MenuItem
          title={t("sharedLogs")}
          link="/reports/logs"
          icon={<NotesIcon />}
          selected={location.pathname === "/reports/logs"}
        />
        {!readonly && (
          <MenuItem
            title={t("reportScheduled")}
            link="/reports/scheduled"
            // icon={<EventRepeatIcon />}
            icon={<EventRepeatTwoToneIcon />}
            selected={location.pathname === "/reports/scheduled"}
          />
        )}
        {admin && (
          <MenuItem
            title={t("statisticsTitle")}
            link="/reports/statistics"
            icon={<BarChartIcon />}
            selected={location.pathname === "/reports/statistics"}
          />
        )}
      </List>
    </>
  );
};

export default ReportsMenu;
