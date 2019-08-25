import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Divider from 'antd/es/divider'
import Form from 'antd/es/form'
import InputNumber from 'antd/es/input-number'
import Modal from 'antd/es/modal'

import {validateFields} from '../../common/components/FormCard'
import DatePicker from '../../common/components/DatePicker'
import {useProfile} from '../../profile/hooks'
import $profile from '../../profile/service'
import {isDemo} from '../demo'

const STORAGE_KEY = 'demo'

function ModuleWelcomeDemo(props) {
  const {getFieldDecorator} = props.form
  const profile = useProfile()
  const [visible, setVisible] = useState(false)
  const [turnoverSince, setTurnoverSince] = useState()
  const {t, i18n} = useTranslation()

  useEffect(() => {
    if (profile && !isDemo(profile) && !profile.welcomed) {
      setVisible(true)
    }
  }, [profile])

  useEffect(() => {
    if (profile && isDemo(profile)) {
      setVisible(!localStorage.getItem(STORAGE_KEY))
    }
  }, [profile])

  if (!profile) {
    return null
  }

  async function submit() {
    const {activityStartedAt, previousTurnover} = await validateFields(props.form)
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, true)
    $profile.set({
      ...profile,
      welcomed: true,
      previousTurnover,
      activityStartedAt: activityStartedAt.toISOString(),
    })
  }

  function setActivityStartDate(nextActivityStartedAt) {
    const firstDayOfActivity = DateTime.fromISO(nextActivityStartedAt.toISOString()).setLocale(
      i18n.language,
    )

    const firstDayOfYear = DateTime.local()
      .setLocale(i18n.language)
      .set({
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })

    setTurnoverSince(firstDayOfActivity > firstDayOfYear ? firstDayOfActivity : firstDayOfYear)
  }

  return (
    <Modal
      title={t('/dashboard.modal-title')}
      visible={visible}
      cancelText={t('close')}
      closable={false}
      footer={
        <Button type="primary" onClick={submit}>
          {t('confirm')}
        </Button>
      }
    >
      <p dangerouslySetInnerHTML={{__html: t('/dashboard.modal-content-1')}} />
      <p style={{margin: 0}} dangerouslySetInnerHTML={{__html: t('/dashboard.modal-content-2')}} />

      <Divider />

      <Form noValidate layout="vertical">
        <Form.Item label={t('activity-started-at')}>
          {getFieldDecorator('activityStartedAt', {
            rules: [
              {
                required: true,
                message: t('field-required'),
              },
            ],
          })(<DatePicker onChange={setActivityStartDate} />)}
        </Form.Item>

        {turnoverSince && (
          <Form.Item
            label={t('turnover-since', {
              date: turnoverSince.toFormat(t('date-format-short')),
            })}
          >
            {getFieldDecorator('previousTurnover', {
              rules: [
                {
                  required: true,
                  message: t('field-required'),
                },
              ],
            })(<InputNumber size="large" min={0} step={1} style={{width: '100%'}} />)}
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default Form.create()(ModuleWelcomeDemo)
