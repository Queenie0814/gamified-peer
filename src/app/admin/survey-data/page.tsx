'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import styles from './page.module.scss';

interface SurveyData {
  id: number;
  studentId: string;
  studentName: string;
  groupName: string;
  completeness: number;
  accuracy: number;
  richness: number;
  referability: number;
  conceptMapTotalScore: number;
  advantage: string;
  suggest: string;
  skillReflection: string;
  cognitiveReflection: string;
  recommend: number;
  personalScore: number;
  submitTime: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SurveyDataPage() {
  const [data, setData] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('submitTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRow, setSelectedRow] = useState<SurveyData | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/survey-data?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('取得資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      '學生ID',
      '學生姓名',
      '組別',
      '完整性',
      '準確性',
      '豐富性',
      '參考性',
      '概念圖總分',
      '優點',
      '建議',
      '技能反思',
      '認知反思',
      '推薦度',
      '個人分數',
      '提交時間',
    ];

    const csvData = data.map((row) => [
      row.id,
      row.studentId,
      row.studentName,
      row.groupName,
      row.completeness,
      row.accuracy,
      row.richness,
      row.referability,
      row.conceptMapTotalScore,
      `"${row.advantage.replace(/"/g, '""')}"`,
      `"${row.suggest.replace(/"/g, '""')}"`,
      `"${row.skillReflection.replace(/"/g, '""')}"`,
      `"${row.cognitiveReflection.replace(/"/g, '""')}"`,
      row.recommend,
      row.personalScore,
      dayjs(row.submitTime).format('YYYY-MM-DD HH:mm:ss'),
    ]);

    const csv = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `survey_data_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>問卷資料管理</h1>
        <div className={styles.stats}>
          <span>總計: {pagination.total} 筆資料</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="搜尋學生ID、姓名或組別..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            搜尋
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSearchInput('');
              }}
              className={styles.clearButton}
            >
              清除
            </button>
          )}
        </form>
        <button onClick={exportToCSV} className={styles.exportButton} disabled={data.length === 0}>
          匯出 CSV
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>載入中...</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className={styles.sortable}>
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('studentId')} className={styles.sortable}>
                    學生ID {sortBy === 'studentId' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('studentName')} className={styles.sortable}>
                    學生姓名 {sortBy === 'studentName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('groupName')} className={styles.sortable}>
                    組別 {sortBy === 'groupName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('conceptMapTotalScore')} className={styles.sortable}>
                    概念圖總分 {sortBy === 'conceptMapTotalScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('personalScore')} className={styles.sortable}>
                    個人分數 {sortBy === 'personalScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('recommend')} className={styles.sortable}>
                    推薦度 {sortBy === 'recommend' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('submitTime')} className={styles.sortable}>
                    提交時間 {sortBy === 'submitTime' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.studentId}</td>
                    <td>{row.studentName}</td>
                    <td>{row.groupName}</td>
                    <td>{row.conceptMapTotalScore}</td>
                    <td>{row.personalScore}</td>
                    <td>{row.recommend}</td>
                    <td>{dayjs(row.submitTime).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td>
                      <button onClick={() => setSelectedRow(row)} className={styles.detailButton}>
                        詳情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={styles.paginationButton}
            >
              上一頁
            </button>
            <span className={styles.pageInfo}>
              第 {pagination.page} / {pagination.totalPages} 頁
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={styles.paginationButton}
            >
              下一頁
            </button>
          </div>
        </>
      )}

      {selectedRow && (
        <div className={styles.modal} onClick={() => setSelectedRow(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>詳細資料</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <strong>ID:</strong>
                <span>{selectedRow.id}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>學生ID:</strong>
                <span>{selectedRow.studentId}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>學生姓名:</strong>
                <span>{selectedRow.studentName}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>組別:</strong>
                <span>{selectedRow.groupName}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>完整性:</strong>
                <span>{selectedRow.completeness}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>準確性:</strong>
                <span>{selectedRow.accuracy}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>豐富性:</strong>
                <span>{selectedRow.richness}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>參考性:</strong>
                <span>{selectedRow.referability}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>概念圖總分:</strong>
                <span>{selectedRow.conceptMapTotalScore}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>個人分數:</strong>
                <span>{selectedRow.personalScore}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>推薦度:</strong>
                <span>{selectedRow.recommend}</span>
              </div>
              <div className={styles.detailItemFull}>
                <strong>優點:</strong>
                <p>{selectedRow.advantage}</p>
              </div>
              <div className={styles.detailItemFull}>
                <strong>建議:</strong>
                <p>{selectedRow.suggest}</p>
              </div>
              <div className={styles.detailItemFull}>
                <strong>技能反思:</strong>
                <p>{selectedRow.skillReflection}</p>
              </div>
              <div className={styles.detailItemFull}>
                <strong>認知反思:</strong>
                <p>{selectedRow.cognitiveReflection}</p>
              </div>
              <div className={styles.detailItem}>
                <strong>提交時間:</strong>
                <span>{dayjs(selectedRow.submitTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>創建時間:</strong>
                <span>{dayjs(selectedRow.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </div>
            <button onClick={() => setSelectedRow(null)} className={styles.closeButton}>
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
