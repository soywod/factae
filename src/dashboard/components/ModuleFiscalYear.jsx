import React, {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Checkbox from 'antd/es/checkbox'
import Dropdown from 'antd/es/dropdown'
import Tooltip from 'antd/es/tooltip'
import Menu from 'antd/es/menu'
import Modal from 'antd/es/modal'
import Icon from 'antd/es/icon'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import pipe from 'lodash/fp/pipe'
import random from 'lodash/fp/random'
import range from 'lodash/fp/range'

import Link from '../../common/components/Link'
import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {toEuro} from '../../utils/currency'
import {isDemo, demoDate} from '../demo'
import {getTurnover, getCumulativeTurnover, getTheoricCumulativeTurnover} from '../fiscalYear'
import {useThresholds} from '../hooks'
import ChartLineFiscalYear from './ChartLineFiscalYear'

const links = [
  'https://www.service-public.fr/professionnels-entreprises/vosdroits/F32353',
  'https://www.shine.fr/blog/assujetti-tva-auto-entrepreneur',
  'https://www.portail-autoentrepreneur.fr/actualites/comment-faire-declaration-tva',
  'https://www.auto-entrepreneur.fr/statut-auto-entrepreneur/limites/plafonds.html',
]

function ModuleFiscalYear() {
  const profile = useProfile()
  const documents = useDocuments()
  const [helpVisible, setHelpVisible] = useState(false)
  const [turnoverVisible, setTurnoverVisible] = useState(true)
  const [cumulativeTurnoverVisible, setCumulativeTurnoverVisible] = useState(false)
  const [theoricCumulativeTurnoverVisible, setTheoricCumulativeTurnoverVisible] = useState(false)
  const [thresholdVATLowVisible, setThresholdVATLowVisible] = useState(false)
  const [thresholdVATHighVisible, setThresholdVATHighVisible] = useState(false)
  const [thresholdMEVisible, setThresholdMEVisible] = useState(false)
  const [lowTVA, highTVA, AE] = useThresholds()
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

    function filterByType(document) {
      if (document.type === 'invoice' && document.paidAt) return true
      if (document.type === 'credit' && document.refundedAt) return true
      return false
    }

    function adjustTotal(document) {
      const totalHT = (() => {
        if (document.type === 'credit') return -document.totalHT
        return document.totalHT
      })()

      return {...document, totalHT}
    }

    return pipe([filter(filterByType), map(adjustTotal)])(documents)
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
        <Checkbox checked={turnoverVisible} onChange={handleCheck(setTurnoverVisible)}>
          {t('real-turnover')}
          <Tooltip title={t('real-turnover-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="2">
        <Checkbox
          checked={cumulativeTurnoverVisible}
          onChange={handleCheck(setCumulativeTurnoverVisible)}
        >
          {t('cumulative-turnover')}
          <Tooltip title={t('cumulative-turnover-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="3">
        <Checkbox
          checked={theoricCumulativeTurnoverVisible}
          onChange={handleCheck(setTheoricCumulativeTurnoverVisible)}
        >
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
        <Checkbox
          checked={thresholdVATLowVisible}
          onChange={handleCheck(setThresholdVATLowVisible)}
        >
          {t('threshold-vat-low')}
          <Tooltip title={t('threshold-vat-low-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="2">
        <Checkbox
          checked={thresholdVATHighVisible}
          onChange={handleCheck(setThresholdVATHighVisible)}
        >
          {t('threshold-vat-high')}
          <Tooltip title={t('threshold-vat-high-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="3">
        <Checkbox checked={thresholdMEVisible} onChange={handleCheck(setThresholdMEVisible)}>
          {t('threshold-me')}
          <Tooltip title={t('threshold-me-help')}>
            <Icon type="question-circle-o" style={{marginLeft: 8}} />
          </Tooltip>
        </Checkbox>
      </Menu.Item>
    </Menu>
  )

  return (
    <>
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
            <Icon
              type="question-circle-o"
              onClick={() => setHelpVisible(true)}
              style={{marginLeft: 8}}
            />
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

      <Modal
        title={t('thresholds')}
        visible={helpVisible}
        onCancel={() => setHelpVisible(false)}
        footer={null}
        width={700}
      >
        <div dangerouslySetInnerHTML={{__html: t('/dashboard.part-a', {value: toEuro(lowTVA)})}} />
        <ul>
          <li>{t('/dashboard.part-a-1')}</li>
          <li>{t('/dashboard.part-a-2')}</li>
          <li>{t('/dashboard.part-a-3')}</li>
        </ul>
        <div dangerouslySetInnerHTML={{__html: t('/dashboard.part-b', {value: toEuro(highTVA)})}} />
        <ul>
          <li>{t('/dashboard.part-b-1')}</li>
          <li>{t('/dashboard.part-b-2')}</li>
          <li>{t('/dashboard.part-b-3')}</li>
        </ul>
        <div dangerouslySetInnerHTML={{__html: t('/dashboard.part-c', {value: toEuro(AE)})}} />
        <ul>
          <li>{t('/dashboard.part-c-1')}</li>
        </ul>
        <div style={{marginTop: 30}}>
          {links.map((link, key) => (
            <div key={key}>
              <Link to={link} />
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default ModuleFiscalYear
