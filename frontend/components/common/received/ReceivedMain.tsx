'use client';

import {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {Skeleton} from '@/components/ui/skeleton';
import {Separator} from '@/components/ui/separator';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {DataChart, DataTable} from '@/components/common/received';
import services from '@/lib/services';
import {ReceiveHistoryItem} from '@/lib/services/project/types';
import {motion} from 'motion/react';

const PAGE_SIZE = 100;

/**
 * 数据图表骨架屏组件
 */
const DataChartSkeleton = () => {
  const chartBarHeights = [60, 35, 50, 25, 30, 55, 45];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Skeleton className="h-3 w-8 mb-1" />
            <Skeleton className="h-[18px] w-12" />
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>

        <div className="py-2">
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="w-full max-w-full px-8">
              <div className="flex items-end justify-between h-48 gap-4">
                {chartBarHeights.map((height, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <Skeleton
                      className="w-8 bg-blue-100 dark:bg-blue-900/20"
                      style={{height: `${height}px`}}
                    />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 数据表格骨架屏组件
 */
const DataTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-48" />
    </div>

    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="w-[100px]">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="w-[120px]">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="text-right w-[60px]">
              <Skeleton className="h-4 w-12 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({length: 10}).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <div className="flex items-center justify-between px-2">
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center space-x-1">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-7 w-7" />
      </div>
    </div>
  </div>
);

/**
 * 我的领取页面主组件
 */
export function ReceivedMain() {
  const [data, setData] = useState<ReceiveHistoryItem[]>([]);
  const [Loading, setLoading] = useState(true);

  /**
   * 获取所有领取记录
   */
  const fetchAllReceiveHistory = async () => {
    try {
      setLoading(true);

      const firstPageResult = await services.project.getReceiveHistorySafe({
        current: 1,
        size: PAGE_SIZE,
      });

      if (!firstPageResult.success || !firstPageResult.data) {
        throw new Error(firstPageResult.error || '获取数据失败');
      }

      const {total, results} = firstPageResult.data;
      const allResults = [...results];

      if (total > PAGE_SIZE) {
        const totalPages = Math.ceil(total / PAGE_SIZE);
        const remainingPages = Array.from({length: totalPages - 1}, (_, i) => i + 2);

        const remainingRequests = remainingPages.map((page) =>
          services.project.getReceiveHistorySafe({
            current: page,
            size: PAGE_SIZE,
          }),
        );

        const remainingResults = await Promise.all(remainingRequests);

        remainingResults.forEach((result) => {
          if (result.success && result.data) {
            allResults.push(...result.data.results);
          }
        });
      }

      setData(allResults);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReceiveHistory();
  }, []);

  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {duration: 0.6, ease: 'easeOut'},
    },
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的领取</h1>
          <p className="text-muted-foreground mt-1">
            查看您已领取的分发项目信息和内容
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Separator className="my-8" />
      </motion.div>

      <motion.div className="space-y-6" variants={itemVariants}>
        {Loading ? (
          <>
            <DataChartSkeleton />
            <Separator className="my-8" />
            <DataTableSkeleton />
          </>
        ) : (
          <>
            <DataChart data={data} />
            <Separator className="my-8" />
            <DataTable data={data} />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
