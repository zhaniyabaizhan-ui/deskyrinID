import type { DemoPresetDefinition, DemoPresetId } from '@/demo/presets/types'
import { STUB_PRESET } from '@/demo/presets/stubPreset'

/**
 * Central registry — add new `DemoPresetDefinition` entries here
 * when you drop in final synthetic candidate packages.
 */
export const DEMO_PRESETS: DemoPresetDefinition[] = [STUB_PRESET]

export function getDemoPreset(id: DemoPresetId): DemoPresetDefinition | undefined {
  return DEMO_PRESETS.find((p) => p.id === id)
}

export function defaultDemoPreset(): DemoPresetDefinition {
  return STUB_PRESET
}
