import React, {useMemo} from "react"
import {useTranslation} from "react-i18next"
import {DateTime} from "luxon"
import Card from "antd/lib/card"
import random from "lodash/fp/random"

import {useProfile} from "../../profile/hooks"
import {useDocuments} from "../../document/hooks"
import {toEuro} from "../../utils/currency"
import {isDemo, demoDate} from "../demo"
import {getTurnover} from "../turnover"

import styles from "./ModuleTurnover.styles"

function ModuleYearlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {t} = useTranslation()

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) return random(2000, 6000)
    const now = isDemo(profile) ? demoDate : DateTime.local()
    return getTurnover(documents, now)
  }, [profile, documents])

  const color = turnover ? {color: "#30c79c"} : {}

  return (
    <Card bodyStyle={styles.card}>
      <span style={{...styles.turnover, ...color}}>{toEuro(turnover || 0)}</span>
      <em style={styles.info}>{t("collected-turnover-this-year")}</em>
    </Card>
  )
}

export default ModuleYearlyTurnover
