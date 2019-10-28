import * as React from 'react';
import { useParams } from 'react-router-dom';
import { DateRangePicker, DateInputProps } from '@progress/kendo-react-dateinputs';
import { addDays } from '@progress/kendo-date-math';
import { classNames } from '@progress/kendo-react-common';
import { DropDownList, ListItemProps } from '@progress/kendo-react-dropdowns';
import chartData from '../../data/chart.json';

import { ReactComponent as areaIcon } from '../../icons/area.svg';
import { ReactComponent as lineIcon } from '../../icons/line.svg';
import { ReactComponent as candleIcon } from '../../icons/candle.svg';
import {
    StockChart,
    // ChartTitle,
    ChartSeries,
    ChartSeriesItem,
    // ChartNavigator,
    // ChartNavigatorSelect,
    // ChartNavigatorSeries,
    // ChartNavigatorSeriesItem
} from '@progress/kendo-react-charts';

import styles from './detailed.module.scss';

const DEFAULT_RANGE = {
    start: new Date(),
    end: addDays(new Date(), 1)
}

const options = [
    { name: '1D', duration: 1 },
    { name: '5D', duration: 5 },
    { name: '1M', duration: 30 },
    { name: '3M', duration: 90 },
    { name: '6M', duration: 180 },
    { name: 'YTD', duration: 365 }
]

const CustomEndDateInput = (props: DateInputProps<null>) => {
    const [selected, setSelected] = React.useState<string>(options[0].name);

    const handleClick = React.useCallback(
        (event: React.SyntheticEvent<HTMLAnchorElement>) => {
            const duration = (event.target as HTMLElement).getAttribute('data-duration');
            const name = (event.target as HTMLElement).getAttribute('data-name');

            if (name) { setSelected(name); }
            if (duration && props.onChange) {
                props.onChange.call(undefined, {
                    syntheticEvent: event,
                    nativeEvent: event.nativeEvent,
                    value: new Date(2019, 11, 30),
                    target: null
                });
            }
        }, [])

    const handleFocus = React.useCallback(
        (event: React.FocusEvent<any>) => {
            event.stopPropagation();
        }, [])

    return (
        <span className={classNames("d-inline-block", styles['end-date-input'])} onFocus={handleFocus}>
            <ul className="k-reset d-flex">
                {options.map((item, id) =>
                    <li className="ml-3" key={item.name} >
                        <a
                            href="#"
                            onClick={handleClick}
                            data-name={item.name}
                            data-duration={item.duration}
                            className={classNames(
                                'list-item',
                                styles['list-item'],
                                { [styles['list-item-selected']]: item.name === selected },
                            )}
                        >
                            {item.name}
                        </a>
                    </li>
                )}
            </ul>
        </span>)
}

const customItemRender = (el: React.ReactElement<HTMLLIElement>, props: ListItemProps) => (
    <el.type
        {...el.props}
        className={classNames(
            "pl-2",
            el.props.className,
            styles['ddl-list-item'],
            {
                [styles['k-state-selected']]: props.selected
            })}
    >
        <props.dataItem.icon />
        &nbsp;
        <span className="ml-3">{props.dataItem.name}</span>
    </el.type>)

const customValueRender = (el: any, value: any) => (
    <el.type
        {...el.props}
        className={classNames(
            "pl-2",
            el.props.className,
            styles['ddl-list-item'])}
    >
        {value
            ? (<><value.icon />
                &nbsp;
                <span className="ml-3">{value.name}</span></>)
            : null}

    </el.type>)

const ChartTypePicker = (props: any) => {
    const data = React.useMemo(() => [
        { name: 'Line', icon: lineIcon, type: 'line' },
        { name: 'Area', icon: areaIcon, type: 'area' },
        { name: 'Candle', icon: candleIcon, type: 'candle' }
    ], []);

    const handleChange = React.useCallback(
        (event) => {
            if (props.onChange) {
                props.onChange.call(undefined, { value: event.target.value.type })
            }
        },
        [props.onChange]
    )

    return (
        <DropDownList
            data={data}
            value={data.find(i => i.type === props.value)}
            onChange={handleChange}
            textField={'name'}
            itemRender={customItemRender}
            valueRender={customValueRender}
        />
    )
}

const processData = (data: any) => {
    const result = Object.keys(data.intraday).reduce((acc: any[], current: string) => {
        const other = data.intraday[current];
        return [...acc, {
            open: Number.parseFloat(other.open),
            close: Number.parseFloat(other.close),
            low: Number.parseFloat(other.low),
            volume: Number.parseFloat(other.volume),
            date: `\/Date(${new Date(current).getTime()})\/`
        }]
    }, [])

    return result;
}

export const DetailedChart = () => {
    const { symbol } = useParams();
    const [data, setData] = React.useState(processData(chartData));
    const [range, setRange] = React.useState(DEFAULT_RANGE);
    const [type, setType] = React.useState('candle');

    const handleChange = (event: any) => {
        setRange(event.value);
    }

    const handleTypeChange = (event: any) => {
        setType(event.value);
    }

    return (
        <>
            <div className="row">
                <div className="col text-left">
                    <DateRangePicker
                        defaultValue={range}
                        startDateInputSettings={{ label: '' }}
                        endDateInput={CustomEndDateInput}
                    />
                </div>
                <div className="col text-right">
                    <ChartTypePicker
                        value={type}
                        onChange={handleTypeChange}
                    />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col">
                    <StockChart>
                        <ChartSeries>
                            <ChartSeriesItem
                                data={data}
                                type="candlestick"
                                openField="open"
                                closeField="close"
                                lowField="low"
                                highField="hight"
                                categoryField="date"
                            />
                        </ChartSeries>
                        {/* <ChartNavigator>
                            <ChartNavigatorSelect from={from} to={to} />
                            <ChartNavigatorSeries>
                                <ChartNavigatorSeriesItem
                                    // data={stockData}
                                    type="area"
                                    field="Close"
                                    categoryField="Date"
                                />
                            </ChartNavigatorSeries>
                        </ChartNavigator> */}
                    </StockChart>
                </div>
            </div>
        </>
    )
}