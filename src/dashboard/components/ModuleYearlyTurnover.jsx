import React, {useMemo} from "react"
import {useTranslation} from "react-i18next"
import {DateTime} from "luxon"
import Card from "antd/lib/card"
import filter from "lodash/fp/filter"
import map from "lodash/fp/map"
import pipe from "lodash/fp/pipe"
import random from "lodash/fp/random"
import range from "lodash/fp/range"
import last from "lodash/fp/last"

import {useProfile} from "../../profile/hooks"
import {useDocuments} from "../../document/hooks"
import {toEuro} from "../../utils/currency"
import {isDemo, demoDate} from "../demo"
import {getTurnover, getCumulativeTurnover} from "../fiscalYear"

import styles from "./ModuleTurnover.styles"

function ModuleYearlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
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

    function filterByType(doc) {
      if (!["invoice", "credit"].includes(doc.type)) return false
      if (doc.cancelledAt) return false
      if (doc.type === "invoice" && !doc.paidAt) return false
      if (doc.type === "credit" && !doc.refundedAt) return false
      return true
    }

    function adjustTotal(doc) {
      const totalHT = (() => {
        if (doc.type === "credit") return -doc.totalHT
        return doc.totalHT
      })()

      return {...doc, totalHT}
    }

    return pipe([filter(filterByType), map(adjustTotal)])(documents)
  }, [profile, documents])

  const turnover = useMemo(() => {
    if (!profile || !invoices) return null
    if (isDemo(profile)) return random(2000, 6000)
    const now = isDemo(profile) ? demoDate : DateTime.local()
    return getTurnover(invoices, now)
  }, [profile, invoices])

  const cumulativeTurnover = useMemo(() => {
    if (!profile) return null
    return getCumulativeTurnover(invoices, turnover)
  }, [profile, invoices, turnover])

  const color = turnover ? {color: "#30c79c"} : {}

  return (
    <Card bodyStyle={styles.card}>
      <span style={{...styles.turnover, ...color}}>{toEuro(last(cumulativeTurnover) || 0)}</span>
      <em style={styles.info}>{t("collected-turnover-this-year")}</em>
    </Card>
  )
}

export default ModuleYearlyTurnover
