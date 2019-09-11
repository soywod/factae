import React, {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Checkbox from 'antd/es/checkbox'
import Dropdown from 'antd/es/dropdown'
import Tooltip from 'antd/es/tooltip'
import Menu from 'antd/es/menu'
import Icon from 'antd/es/icon'
import filter from 'lodash/fp/filter'
import random from 'lodash/fp/random'
import range from 'lodash/fp/range'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {isDemo, demoDate} from '../demo'
import {getTurnover, getCumulativeTurnover, getTheoricCumulativeTurnover} from '../fiscalYear'
import ChartLineFiscalYear from './ChartLineFiscalYear'

function ModuleFiscalYear() {
  const profile = useProfile()
  const documents = useDocuments()
  const [turnoverVisible, setTurnoverVisible] = useState(true)
  const [cumulativeTurnoverVisible, setCumulativeTurnoverVisible] = useState(false)
  const [theoricCumulativeTurnoverVisible, setTheoricCumulativeTurnoverVisible] = useState(false)
  const [thresholdVATLowVisible, setThresholdVATLowVisible] = useState(false)
  const [thresholdVATHighVisible, setThresholdVATHighVisible] = useState(false)
  const [thresholdMEVisible, setThresholdMEVisible] = useState(false)
  const {t} = useTranslation()

  const invoices = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) {
      return range(0, 9).map(month => ({
        totalHT: random(3000, 9000),
        createdAt: `2018-0${month + 1}-01`,
        paidAt: `2018-0${month + 1}-01`,
      }))
    }
    return filter(d => d.type === 'invoice' && Boolean(d.paidAt), documents) || null
  }, [profile, documents])

  const turnover = useMemo(() => {
    if (!profile) return null
    const now = isDemo(profile) ? demoDate : DateTime.local()
    return getTurnover(invoices, now)
  }, [profile, invoices])

  const cumulativeTurnover = useMemo(() => {
    if (!profile) return null
    return getCumulativeTurnover(invoices, turnover)
  }, [profile, invoices, turnover])

  const theoricCumulativeTurnover = useMemo(() => {
    if (!profile) return null
    return getTheoricCumulativeTurnover(turnover)
  }, [profile, turnover])

  function handleCheck(setter) {
    return event => setter(event.target.checked)
  }

  const turnoverMenu = (
    <Menu>
      <Menu.Item key="1">
        <Checkbox onChange={handleCheck(setTurnoverVisible)}>
          {t('real-turnover')}
          <Tooltip title={t('real-turnover-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="2">
        <Checkbox onChange={handleCheck(setCumulativeTurnoverVisible)}>
          {t('cumulative-turnover')}
          <Tooltip title={t('cumulative-turnover-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="3">
        <Checkbox onChange={handleCheck(setTheoricCumulativeTurnoverVisible)}>
          {t('theoric-cumulative-turnover')}
          <Tooltip title={t('theoric-cumulative-turnover-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
    </Menu>
  )

  const thresholdsMenu = (
    <Menu>
      <Menu.Item key="1">
        <Checkbox onChange={handleCheck(setThresholdVATLowVisible)}>
          {t('threshold-vat-low')}
          <Tooltip title={t('threshold-vat-low-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="2">
        <Checkbox onChange={handleCheck(setThresholdVATHighVisible)}>
          {t('threshold-vat-high')}
          <Tooltip title={t('threshold-vat-high-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="3">
        <Checkbox onChange={handleCheck(setThresholdMEVisible)}>
          {t('threshold-vat-me')}
          <Tooltip title={t('threshold-vat-me-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
    </Menu>
  )

  return (
    <Card
      title={
        <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
          <FormCardTitle
            title={'fiscal-year'}
            titleData={{year: isDemo(profile) ? demoDate.year : DateTime.local().year}}
            style={{flex: 1}}
          />
          <Dropdown overlay={turnoverMenu}>
            <Button size="small">
              {t('turnover')}
              <Icon type="caret-down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={thresholdsMenu}>
            <Button size="small" style={{marginLeft: 8}}>
              {t('thresholds')}
              <Icon type="caret-down" />
            </Button>
          </Dropdown>
          <Icon type="question-circle-o" onClick={console.log} style={{marginLeft: 8}} />
        </div>
      }
    >
      <ChartLineFiscalYear
        turnover={turnover}
        cumulativeTurnover={cumulativeTurnover}
        theoricCumulativeTurnover={theoricCumulativeTurnover}
        turnoverVisible={turnoverVisible}
        cumulativeTurnoverVisible={cumulativeTurnoverVisible}
        theoricCumulativeTurnoverVisible={theoricCumulativeTurnoverVisible}
        thresholdVATLowVisible={thresholdVATLowVisible}
        thresholdVATHighVisible={thresholdVATHighVisible}
        thresholdMEVisible={thresholdMEVisible}
      />
    </Card>
  )
}

export default ModuleFiscalYear
