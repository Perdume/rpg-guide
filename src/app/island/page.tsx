import { Ref } from '@/components/refs'
import { ItemIcon, KV, Page, Panel, Table, cx, ui } from '@/components/ui'
import * as d from '@/lib/data'

export const metadata = { title: '섬 자원' }

const UP: Record<string, string> = { generator: '생성기', rift: '균열', size: '섬 크기', miner: '자동 채굴기' }
const TIER: Record<string, string> = { 'tier1-2': '1~2단계', 'tier3-4': '3~4단계', tier5: '5단계' }

export default function Island() {
  const is = d.island()
  const tiers = Object.keys(is.generator_ore_weights)
  const ores: string[] = is.ores.map((o: any) => o.ore)
  const share = (t: string, ore: string) => {
    const w = is.generator_ore_weights[t]
    const total = Object.values<number>(w).reduce((a, b) => a + b, 0)
    return w[ore] === undefined ? '' : `${((w[ore] / total) * 100).toFixed(1)}%`
  }
  return (
    <Page title="섬 자원" lead="섬에서 캐고, 키우고, 베는 것의 단계와 수치입니다." icon={['island', 'gray']}>
      <Panel title="광석" tex="stone">
        <Table
          cols={[{ label: '광석', main: true, w: 1.4 }, { label: '채굴 레벨', right: true }, { label: '경험치', right: true }, ...tiers.map((t) => ({ label: `생성기 ${TIER[t] ?? t}`, right: true }))]}
          rows={is.ores.map((o: any) => [o.ore, `Lv.${o.mining_level}`, o.exp, ...tiers.map((t) => share(t, o.ore))])}
          keys={ores}
        />
        <p className={cx(ui.note, 't-tiny')}>생성기 칸은 그 단계에서 해당 광석이 나올 비율입니다.</p>
      </Panel>

      <div className={ui.cols}>
        <Panel title="보석" tex="deepslate">
          <p className="t-dim">{d.clean(is.gems.chance)}</p>
          <Table keep cols={[{ label: '보석', main: true, w: 1.6 }, { label: '채굴', right: true }, { label: '경험치', right: true }]} rows={is.gems.list.map((g: any) => [<Ref key="r" r={g.gem} />, `Lv.${g.mining_level}`, g.exp])} />
        </Panel>
        <Panel title="작물" tex="dirt">
          <Table keep cols={[{ label: '작물', main: true, w: 1.6 }, { label: '농사', right: true }, { label: '경험치', right: true }]} rows={is.crops.map((c: any) => [
            <div key="c" className={cx('row', ui.gap8, ui.center)}><ItemIcon material={c.id} name={c.name} size={16} /><span>{c.name}</span></div>, `Lv.${c.level}`, c.exp,
          ])} />
        </Panel>
      </div>

      <Panel title="약초" tex="grass-side">
        <Table
          cols={[{ label: '약초', main: true, w: 1.4 }, { label: '씨앗', w: 1.4 }, { label: '농사 레벨', right: true }, { label: '수확', right: true }, { label: '씨앗 확률', right: true }, { label: '경험치', right: true }]}
          rows={is.herbs.map((h: any) => [<Ref key="p" r={h.product} />, <Ref key="s" r={h.seed} />, `Lv.${h.farming_level}`, `${d.range(h.harvest)}개`, d.pct(h.seed_chance), h.exp])}
        />
      </Panel>

      <Panel title="나무" tex="log">
        <Table
          cols={[{ label: '원목', main: true, w: 1.3 }, { label: '묘목', w: 1.2 }, { label: '벌목 레벨', right: true }, { label: '원목당 경험치', right: true }, { label: '부산물', w: 1.4 }, { label: '확률', right: true, w: 0.6 }]}
          rows={is.trees.map((t: any) => [t.tree, t.sapling, `Lv.${t.woodcutting_level}`, t.exp_per_log, t.byproduct ? <Ref key="b" r={t.byproduct} /> : '', t.byproduct ? d.pct(t.byproduct_chance) : ''])}
        />
      </Panel>

      <Panel title="업그레이드 비용" tex="cobble">
        <p className="t-dim">{d.clean(is.upgrade_cost_formula)}</p>
        <Table
          cols={[{ label: '업그레이드', main: true }, { label: '단계' }, { label: '골드', right: true }, { label: '숙련과 연구', w: 2 }, { label: '필요 재료', w: 3 }]}
          rows={is.upgrade_rows.map((r: any) => [UP[r.kind], `${r.from}에서 ${r.to}단계`, d.num(r.gold), `${r.skill} Lv.${r.level} / 섬 연구 ${d.num(r.research)}XP`,
            r.materials.length ? r.materials.map((m: any) => <div key={m.id}><Ref r={m} /></div>) : '재료 없음',
          ])}
        />
        <KV rows={[
          ['균열 확률', Object.entries<number>(is.rift_chance_percent).map(([k, v]) => `${k.replace('tier', '')}단계 ${v}%`).join(', ')],
          ['섬 인원', `최대 ${is.max_members}명`],
        ]} />
      </Panel>
      <Panel title="섬 연구와 부품" tex="log">
        <p className="t-dim">/섬 성장에서 승급과 연구를 함께 관리합니다. 모든 재료는 우클릭으로 나누어 납품할 수 있습니다. 연구 실적은 차감되지 않으며, 다음 표의 골드는 승급할 때 결제합니다.</p>
        <Table
          cols={[{ label: '연구', main: true }, { label: '단계' }, { label: '골드', right: true }, { label: '숙련과 연구', w: 2 }, { label: '필요 재료', w: 3 }]}
          rows={is.research_rows.map((r: any) => [r.name, `${r.from}에서 ${r.to}단계`, d.num(r.gold), `${r.skill} Lv.${r.level} / 섬 연구 ${d.num(r.research)}XP`,
            r.materials.map((m: any) => <div key={m.id}><Ref r={m} /></div>),
          ])}
        />
        <p className={cx(ui.note, 't-tiny')}>조림과 관개는 최대 성장 보정 +20%, 광물 감정은 수수료 20% 할인입니다. 장식 공간은 액자 +64개와 거치대 +16개이며 청크별 한도는 유지합니다. 온실은 최대 +40%, 미니언 저장은 +100%, 구동과 선별은 +20%입니다. 선별은 본체 5단계보다 높은 광물을 만들지 않습니다.</p>
      </Panel>
      <Panel title="광물 감정과 자원 납품" tex="stone">
        <p className="t-dim">/섬 가공 또는 섬 허브에서 이용합니다. 섬의 자연 생성 광석을 채굴하면 {is.workshop.unidentified_chance}% 확률로 미감정 광석을 얻습니다. 조약돌과 직접 설치한 광석은 제외됩니다.</p>
        <Table
          cols={[{ label: '작업', main: true }, { label: '조건' }, { label: '소비 재료', w: 2.2 }, { label: '비용', right: true }, { label: '결과와 보상', w: 2.2 }]}
          rows={is.workshop.jobs.map((j: any) => [j.name, `${j.skill} Lv.${j.level}`,
            j.inputs.map((m: any) => <div key={m.id}><Ref r={m} /></div>), `${d.num(j.fee)}G`,
            j.outcomes.length ? j.outcomes.map((o: any) => <div key={o.item.id}><Ref r={o.item} /> ({d.pct(o.chance)})</div>) : `${d.num(j.gold)}G / ${j.skill} ${d.num(j.exp)}XP`,
          ])}
        />
        <p className={cx(ui.note, 't-tiny')}>납품은 재료를 소비하는 반복 의뢰입니다. 감정 결과는 표의 확률에 따라 하나가 나오며, 모든 결과를 받을 수 있는 인벤토리 공간이 필요합니다. 위 비용은 연구 할인 전이며 광물 감정 연구 4단계에서는 기초 120G, 정밀 320G, 심층 800G가 적용됩니다.</p>
      </Panel>
    </Page>
  )
}
