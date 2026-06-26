import { StkTableColumn } from '@/StkTable';
import { createFilter } from '../../../src/StkTable/index';
import { h } from 'vue';
import ExpandCell from './custom-cells/ExpandCell.vue';
import SourceCell from './custom-cells/SourceCell.vue';
import { DataType } from './types';
import { useI18n } from '../../hooks/useI18n/index';

const { Filter, filterStatus } = createFilter();
export const columns: () => StkTableColumn<DataType>[] = () => {
    const { t } = useI18n();
    return [
        { type: 'seq', dataIndex: 'seq' as any, title: t('seq'), fixed: 'left', width: 70 },
        {
            dataIndex: 'source',
            title: t('source'),
            width: 70,
            sortField: 'source',
            align: 'center',
            fixed: 'left',
            customCell: props => {
                if (props.row._isChildren) {
                    return h(SourceCell, props);
                }
                return h(ExpandCell, props);
            },
        },
        {
            dataIndex: 'code',
            title: t('code'),
            sortField: 'thsCode',
        },
        {
            dataIndex: 'bondAbbreviation',
            title: t('abbreviation'),
            width: 130,
            filterable: true,
            fixed: 'left',
        },
        { dataIndex: 'remainingPeriod', title: t('remainingPeriod') },
        {
            dataIndex: 'bestBuyVol',
            sortType: 'number',
            title: t('buyVolume'),
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            formatter: (value: number) => value.toLocaleString(),
            // customHeaderCell: Filter(
            //     {
            //         options: [
            //             { label: '3000', value: 3000 },
            //             { label: '4000', value: 4000 },
            //             { label: '2000', value: 2000 },
            //         ],
            //     },
            //     ({ col }: { col: StkTableColumn<DataType> }) =>
            //         h('span', {}, [col.label + `(${filterStatus.value.bestBuyVol?.value || '-'})`]),
            // ),
        },
        {
            dataIndex: 'bestBuyPrice',
            title: 'Bid',
            className: 'red-cell',
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            sortType: 'number',
            // customHeaderCell: Filter({
            //     options: [
            //         { label: '<1', value: 1 },
            //         { label: '1-2', value: 2 },
            //         { label: '>2', value: 3 },
            //     ],
            //     // filter({ cellValue, filterValues }) {
            //     //     return filterValues.some(fv => {
            //     //         if (fv === 1) {
            //     //             return cellValue < 1;
            //     //         }
            //     //         if (fv === 2) {
            //     //             return cellValue >= 1 && cellValue < 2;
            //     //         }
            //     //         return cellValue >= 2;
            //     //     });
            //     // },
            // }),
        },
        {
            dataIndex: 'bestSellPrice',
            title: 'Ofr',
            className: 'green-cell',
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            sortType: 'number',
        },
        {
            dataIndex: 'bestSellVol',
            sortType: 'number',
            label: t('sellVolume'),
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            // formatter: (value, row) => value,
            // filter: ({ cellValue, filterValues }) => {
            //     return cellValue > 2000
            // },
            filterable: true,
            // filterOptions: [

            //     { label: '5000', value: 5000, selected: true },
            //     { label: '4000', value: 4000 },
            // ]
            // customHeaderCell: Filter({
            //     options: [
            //         { label: '5000', value: 5000 },
            //         { label: '4000', value: 4000 },
            //     ],
            // }),
        },
        {
            dataIndex: 'lastPrice',
            title: t('transaction'),
            className: 'blue-cell',
            align: 'right',
            headerAlign: 'right',
            sortType: 'number',
            sorter: true,
            filterable: true,
        },
        {
            dataIndex: 'couponRate',
            sortType: 'number',
            title: t('couponRate'),
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'bestTime',
            title: t('time'),
            sortField: 'bestTime',
            align: 'center',
            sorter: true,
            width: 120,
            fixed: 'left',
        },
        {
            dataIndex: 'orgDebtRating',
            title: t('mainDebtRating'),
            customHeaderCell: Filter({ autoOptions: true }),
        },
        { dataIndex: 'cbImpliedRating', title: t('impliedRatingCnBond'), width: 120 },
        { dataIndex: 'csiImpliedRating', title: t('impliedRatingCsi'), width: 120 },
        { dataIndex: 'outlook', title: t('outlook'), sortField: 'outlook' },
        { dataIndex: 'entitlementType', title: t('entitlementType') },
        { dataIndex: 'nextExerciseDate', title: t('nextExerciseDate') },
        { dataIndex: 'expiryDate', title: t('expiryDate') },
        { dataIndex: 'issueWay', title: t('issueWay') },
        { dataIndex: 'crossMarket', title: t('crossMarket') },
        { dataIndex: 'industry', title: t('industry') },
        { dataIndex: 'ratingOrg', title: t('ratingOrg') },
        { dataIndex: 'bondType', title: t('bondType') },
        { dataIndex: 'orgName', title: t('issuer'), sortField: 'orgName', width: 180 },
        {
            dataIndex: 'bestBidNetPrice',
            sortType: 'number',
            title: t('bidReferenceNetPrice'),
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'bestOfrNetPrice',
            sortType: 'number',
            title: t('ofrReferenceNetPrice'),
            align: 'right',
            headerAlign: 'right',
        },
        { dataIndex: 'bestBidClearingSpeed', title: t('bidClearingSpeed') },
        { dataIndex: 'bestOfrClearingSpeed', title: t('ofrClearingSpeed') },
        {
            dataIndex: 'cbValue',
            sortType: 'number',
            title: t('cnBondValuation'),
            sortField: 'cbValuation',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'lastDealCbBp',
            sortType: 'number',
            title: t('transactionCnBondBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'cbNetPriceStr',
            sortType: 'number',
            title: t('netPriceCnBond'),
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'cbDurationStr',
            sortType: 'number',
            title: t('durationCnBond'),
            sortField: 'cbDuration',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'csiValue',
            sortType: 'number',
            title: t('csiValuation'),
            sortField: 'csiValuation',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'lastDealCsiBp',
            sortType: 'number',
            title: t('transactionCsiBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'csiNetPriceStr',
            sortType: 'number',
            title: t('netPriceCsi'),
            sortField: 'csiNetPrice',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'csiCbStr',
            sortType: 'number',
            title: t('csiCnBond'),
            sortField: 'csiCbBp',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'bestBidCbBp',
            sortType: 'number',
            title: t('bidCnBondBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'bestCbOfrBp',
            sortType: 'number',
            title: t('cnBondOfrBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'bestBidCsiBp',
            sortType: 'number',
            title: t('bidCsiBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'bestCsiOfrBp',
            sortType: 'number',
            title: t('csiOfrBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
    ];
};
