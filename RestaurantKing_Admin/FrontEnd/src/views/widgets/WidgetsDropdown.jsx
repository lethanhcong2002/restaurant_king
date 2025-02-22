import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop } from '@coreui/icons'
import axios from 'axios'
import { calculatePercentageChange } from '../../code/caculatorDashboard'
import formatToVND from '../../code/convertPrice'

const WidgetsDropdown = (props) => {
  const [invoiceCounts, setInvoiceCounts] = useState([]);
  const [totalMoney, setTotalMoney] = useState([]);
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })

    axios.get('http://localhost:5000/invoices/invoice_dashboard')
      .then((response) => {
        setInvoiceCounts(response.data.data.invoiceCountsByMonth);
        setTotalMoney(response.data.data.totalPriceByMonth)
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [widgetChartRef1, widgetChartRef2])

  const users = calculatePercentageChange(invoiceCounts[new Date().getMonth() - 1], invoiceCounts[new Date().getMonth()]);
  const money = calculatePercentageChange(totalMoney[new Date().getMonth() - 1], totalMoney[new Date().getMonth()]);
  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={12} xl={6} xxl={6}>
        <CWidgetStatsA
          color="primary"
          value={
            <>
              {invoiceCounts[new Date().getMonth()]}{' '}
              <span className="fs-6 fw-normal">
                ({users}{users.startsWith("-") ? <CIcon icon={cilArrowBottom} /> : <CIcon icon={cilArrowTop} />})
              </span>
            </>
          }
          title="Khách hàng"
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                datasets: [
                  {
                    label: 'Tổng khách hàng',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: invoiceCounts,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: 0,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                    tension: 0.4,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={12} xl={6} xxl={6}>
        <CWidgetStatsA
          color="info"
          value={
            <>
              {formatToVND(totalMoney[new Date().getMonth()])}{' '}
              <span className="fs-6 fw-normal">
                ({money}{money.startsWith("-") ? <CIcon icon={cilArrowBottom} /> : <CIcon icon={cilArrowTop} />})
              </span>
            </>
          }
          title="Thu vào"
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                datasets: [
                  {
                    label: 'Tổng tiền',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: totalMoney,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: 0,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
