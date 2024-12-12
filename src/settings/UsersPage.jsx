// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Table, TableRow, TableCell, TableHead, TableBody, Switch, TableFooter, FormControlLabel, Box,
// } from '@mui/material';
// import LoginIcon from '@mui/icons-material/Login';
// import LinkIcon from '@mui/icons-material/Link';
// import { useCatch, useEffectAsync } from '../reactHelper';
// import { formatBoolean, formatTime } from '../common/util/formatter';
// import { useTranslation } from '../common/components/LocalizationProvider';
// import PageLayout from '../common/components/PageLayout';
// import SettingsMenu from './components/SettingsMenu';
// import CollectionFab from './components/CollectionFab';
// import CollectionActions from './components/CollectionActions';
// import TableShimmer from '../common/components/TableShimmer';
// import { useManager } from '../common/util/permissions';
// import SearchHeader, { filterByKeyword } from './components/SearchHeader';
// import useSettingsStyles from './common/useSettingsStyles';

// const UsersPage = () => {
//   const classes = useSettingsStyles();
//   const navigate = useNavigate();
//   const t = useTranslation();

//   const manager = useManager();

//   const [timestamp, setTimestamp] = useState(Date.now());
//   const [items, setItems] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [temporary, setTemporary] = useState(false);

//   const handleLogin = useCatch(async (userId) => {
//     const response = await fetch(`/api/session/${userId}`);
//     if (response.ok) {
//       window.location.replace('/');
//     } else {
//       throw Error(await response.text());
//     }
//   });

//   const actionLogin = {
//     key: 'login',
//     title: t('loginLogin'),
//     icon: <LoginIcon fontSize="small" />,
//     handler: handleLogin,
//   };

//   const actionConnections = {
//     key: 'connections',
//     title: t('sharedConnections'),
//     icon: <LinkIcon fontSize="small" />,
//     handler: (userId) => navigate(`/settings/user/${userId}/connections`),
//   };

//   useEffectAsync(async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/users');
//       if (response.ok) {
//         setItems(await response.json());
//       } else {
//         throw Error(await response.text());
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [timestamp]);

//   return (
//     <Box sx={{marginTop:"20px"}}>
//     <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
//       <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
//       <Table className={classes.table}>
//         <TableHead>
//           <TableRow>
//             <TableCell>{t('sharedName')}</TableCell>
//             <TableCell>{t('userEmail')}</TableCell>
//             <TableCell>{t('userAdmin')}</TableCell>
//             <TableCell>{t('sharedDisabled')}</TableCell>
//             <TableCell>{t('userExpirationTime')}</TableCell>
//             <TableCell className={classes.columnAction} />
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {!loading ? items.filter((u) => temporary || !u.temporary).filter(filterByKeyword(searchKeyword)).map((item) => (
//             <TableRow key={item.id}>
//               <TableCell>{item.name}</TableCell>
//               <TableCell>{item.email}</TableCell>
//               <TableCell>{formatBoolean(item.administrator, t)}</TableCell>
//               <TableCell>{formatBoolean(item.disabled, t)}</TableCell>
//               <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
//               <TableCell className={classes.columnAction} padding="none">
//                 <CollectionActions
//                   itemId={item.id}
//                   editPath="/settings/user"
//                   endpoint="users"
//                   setTimestamp={setTimestamp}
//                   customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
//                 />
//               </TableCell>
//             </TableRow>
//           )) : (<TableShimmer columns={6} endAction />)}
//         </TableBody>
//         <TableFooter>
//           <TableRow>
//             <TableCell colSpan={6} align="right">
//               <FormControlLabel
//                 control={(
//                   <Switch
//                     value={temporary}
//                     onChange={(e) => setTemporary(e.target.checked)}
//                     size="small"
//                   />
//                 )}
//                 label={t('userTemporary')}
//                 labelPlacement="start"
//               />
//             </TableCell>
//           </TableRow>
//         </TableFooter>
//       </Table>
//       <CollectionFab editPath="/settings/user" />
//     </PageLayout>
//     </Box>
//   );
// };

// export default UsersPage;


import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody, TablePagination, TableSortLabel, TextField, IconButton, 
  Toolbar, Button, FormControlLabel, Switch, Box, Paper, Checkbox, Typography, Tooltip,MenuItem,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import { Add, Search } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const UsersPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace('/');
    } else {
      throw Error(await response.text());
    }
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const sortedItems = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) =>
          order === 'asc'
            ? a[orderBy]?.localeCompare?.(b[orderBy])
            : b[orderBy]?.localeCompare?.(a[orderBy])
        ),
    [items, order, orderBy]
  );

  const visibleItems = useMemo(
    () => sortedItems.filter(filterByKeyword(searchKeyword)),
    [sortedItems, searchKeyword]
  );

  const displayedItems = useMemo(
    () =>
      visibleItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [visibleItems, page, rowsPerPage]
  );

  const handleNavigate = () => {
    navigate('/settings/user');
  };

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <Box sx={{ marginTop: "20px" }}>
      <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

        <Box m="30px" display="flex" alignItems="center" mb={5}>
          <Typography variant="h5" sx={{ flex: 1 }}>
            User
          </Typography>
          <Button
            onClick={handleNavigate}
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: 'black',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
              color: 'white',
            }}
          >
            New User
          </Button>
        </Box>

        <Paper
          sx={{
            m: '30px',
            borderRadius: '10px',
          }}
        >
          <Toolbar>
            <Box sx={{ flex: 1, mt: 2, mb: 2 }}>
              <TextField
                variant="outlined"
                placeholder="Search User ..."
                size="small"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <IconButton edge="start" size="small" sx={{ mr: 1 }}>
                      <Search />
                    </IconButton>
                  ),
                }}
                sx={{
                  flex: 1,
                  maxWidth: '400px',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  },
                }}
              />
            </Box>
          </Toolbar>

          <Table>
            <TableHead sx={{backgroundColor:"#F4F6F8"}}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < items.length}
                    checked={items.length > 0 && selected.length === items.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={(e) => handleRequestSort(e, 'name')}
                  >
                    {t('sharedName')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('userEmail')}</TableCell>
                <TableCell>{t('userAdmin')}</TableCell>
                <TableCell>{t('sharedDisabled')}</TableCell>
                <TableCell>{t('userExpirationTime')}</TableCell>
                <TableCell>Actions</TableCell>

                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                displayedItems.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <TableRow
                      key={item.id}
                      onClick={(e) => handleClick(e, item.id)}
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{formatBoolean(item.administrator, t)}</TableCell>
                      <TableCell>{formatBoolean(item.disabled, t)}</TableCell>
                      <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                      <TableCell>

        <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <MoreVertIcon/>
          
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal

          sx={{zIndex:"1"}}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem onClick={handleClose}>
                    <CollectionActions
                          itemId={item.id}
                          editPath="/settings/user"
                          endpoint="users"
                          setTimestamp={setTimestamp}
                          customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
                        />
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableShimmer columns={7} />
              )}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={visibleItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>

        <Box
          sx={{
            m: "20px 30px 30px 30px",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Box>


        <FormControlLabel
          control={
            <Switch
              value={temporary}
              onChange={(e) => setTemporary(e.target.checked)}
              size="small"
            />
          }
          label={t('userTemporary')}
          labelPlacement="start"
        />
        </Box>
        </Box>
      </PageLayout>
    </Box>
  );
};

export default UsersPage;
