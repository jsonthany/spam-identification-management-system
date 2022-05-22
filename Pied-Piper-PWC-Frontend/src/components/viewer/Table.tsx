import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { getQuarantinedEmails } from '../../services/emailService';
import {
  emailList,
  emailApprovalList,
} from '../../utilities/interfaces/Emails';
import LoadingBackdrop from '../misc/LoadingBackdrop';
import dateFormatter from '../../utilities/helpers/dateFormatter';

interface Data {
  receivedTimestamp: string;
  fromAddressId: string;
  toAddressId: string;
  quarantineStatus: string;
  id: string;
  viewButton?: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'receivedTimestamp',
    numeric: false,
    disablePadding: true,
    label: 'Received',
  },
  {
    id: 'fromAddressId',
    numeric: false,
    disablePadding: false,
    label: 'From',
  },
  {
    id: 'toAddressId',
    numeric: false,
    disablePadding: false,
    label: 'To',
  },
  // {
  //   id: 'quarantineStatus',
  //   numeric: false,
  //   disablePadding: false,
  //   label: 'Status',
  // },
  {
    id: 'viewButton',
    numeric: false,
    disablePadding: true,
    label: '',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps): JSX.Element {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;

  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  selected: readonly string[];
  handleApproval: (a: emailApprovalList) => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps): JSX.Element {
  const { selected, handleApproval } = props;
  const numSelected = selected.length;

  const handleDelete = (): void => {
    const formatData = selected.map((id) => ({
      id,
      quarantineStatus: 'DENIED',
    }));

    handleApproval(formatData);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(
            theme.palette.primary.main,
            theme.palette.action.activatedOpacity,
          ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected}
          {' '}
          selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Quarantined Emails
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon onClick={handleDelete} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Toolbar>
  );
}

type tableProps = {
  handleApproval: (a: emailApprovalList) => void;
  setCurrentEmailId: (a: string) => void;
};

export default function EmailTable(props: tableProps): JSX.Element {
  const { handleApproval, setCurrentEmailId } = props;
  const navigate = useNavigate();

  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('receivedTimestamp');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [emailData, setEmailData] = useState<emailList>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState('');
  const [totalEmails, setTotalEmails] = useState(0);

  type paginatedEmails = {
    data: emailList;
    page: number;
    numEmails: number;
  };

  useEffect(() => {
    async function getEmailData(): Promise<void> {
      try {
        setLoading(true);
        const data: paginatedEmails = await getQuarantinedEmails(
          page + 1,
          rowsPerPage,
          order.toUpperCase(),
          orderBy,
        );
        setEmailData(data.data);
        setTotalEmails(data.numEmails);
        setPage(data.page - 1);
        setLoading(false);
      } catch (e) {
        if (e instanceof Error) {
          setInitialLoadError(e.message);
        } else {
          setInitialLoadError('Something went wrong');
        }
      }
    }

    getEmailData();
  }, [page, rowsPerPage, order, orderBy]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.checked) {
      const newSelecteds = emailData.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (
    event: React.MouseEvent<unknown>,
    name: string,
  ): void => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name: string): boolean => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalEmails) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <LoadingBackdrop loading={loading} initialLoadError={initialLoadError} />
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          selected={selected}
          handleApproval={handleApproval}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={emailData.length}
            />
            <TableBody>
              {emailData.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.receivedTimestamp.length
                        ? dateFormatter(row.receivedTimestamp)
                        : null}
                    </TableCell>
                    <TableCell align="left">{row.fromAddress}</TableCell>
                    <TableCell align="left">{row.toAddress}</TableCell>
                    {/* <TableCell align="left">{row.emailSubject}</TableCell> */}
                    <TableCell align="left">
                      <Button
                        variant="contained"
                        onClick={() => {
                          navigate(`/view/${row.id}`);
                          setCurrentEmailId(row.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalEmails}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          nextIconButtonProps={{
            disabled: page + 1 > Math.floor(totalEmails / rowsPerPage),
          }}
          backIconButtonProps={{
            disabled: page === 0,
          }}
        />
      </Paper>
      )
    </Box>
  );
}
