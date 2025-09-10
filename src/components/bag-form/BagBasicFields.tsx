'use client'

import { FormField, FormInput, FormSelect } from '@/components/ui/FormField'
import { ExtractedBagInfo } from '@/lib/bags'

interface BagBasicFieldsProps {
  bagInfo: ExtractedBagInfo
  onUpdate: (section: keyof ExtractedBagInfo, field: string, value: any) => void
}

export function BagBasicFields({ bagInfo, onUpdate }: BagBasicFieldsProps) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-subtext0 uppercase tracking-wide mb-4">
        Información Básica
      </h3>
      <div className="space-y-4">
        <FormField label="Tostador" required>
          <FormInput
            value={bagInfo.roaster.name}
            onChange={(value) => onUpdate('roaster', 'name', value)}
            placeholder="Nombre del tostador"
          />
        </FormField>
        
        <FormField label="Nombre del Café" required>
          <FormInput
            value={bagInfo.coffee.name}
            onChange={(value) => onUpdate('coffee', 'name', value)}
            placeholder="Nombre del café"
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Origen">
            <FormInput
              value={bagInfo.coffee.origin_country || ''}
              onChange={(value) => onUpdate('coffee', 'origin_country', value)}
              placeholder="ej. Etiopía"
            />
          </FormField>
          
          <FormField label="Tamaño (g)">
            <FormInput
              type="number"
              value={bagInfo.bag.size_g}
              onChange={(value) => onUpdate('bag', 'size_g', parseInt(value) || 0)}
              placeholder="250"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Precio (€)">
            <FormInput
              type="number"
              step="0.01"
              value={bagInfo.bag.price || ''}
              onChange={(value) => onUpdate('bag', 'price', value ? parseFloat(value) : null)}
              placeholder="15.00"
            />
          </FormField>
          
          <FormField label="Fecha de Tueste">
            <FormInput
              type="date"
              value={bagInfo.bag.roast_date || ''}
              onChange={(value) => onUpdate('bag', 'roast_date', value)}
            />
          </FormField>
        </div>
      </div>
    </div>
  )
}