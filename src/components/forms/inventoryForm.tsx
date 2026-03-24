"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Barcode, Truck, Package, Wifi, Monitor, Cpu, Radio, Plug, Paperclip, Box, Layers } from 'lucide-react'

interface InventoryFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  isEditing: boolean
  suppliers: { id: string; name: string }[]
}

export function InventoryForm({ formData, handleInputChange, isEditing, suppliers }: InventoryFormProps) {
  const [selectedItemType, setSelectedItemType] = useState(formData.item_type || "")
  const [attributes, setAttributes] = useState(formData.attributes || {})

  useEffect(() => {
    setSelectedItemType(formData.item_type || "")
    // Ensure attributes is properly initialized
    if (formData.attributes) {
      setAttributes(formData.attributes)
    } else {
      setAttributes({})
    }
  }, [formData])

  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const updatedAttributes = { ...attributes, [name]: value }
    setAttributes(updatedAttributes)

    // Update the formData with the new attributes
    // Create a custom event to update the parent's formData
    const customEvent = {
      target: {
        name: "attributes",
        value: updatedAttributes,
      },
    } as React.ChangeEvent<HTMLInputElement>

    handleInputChange(customEvent)
  }

  const itemTypes = [
    "Fiber Cable",
    "EtherNet Cable",
    "Splitters",
    "ONT",
    "ONU",
    "Fibe OPTIC Patch Cord",
    "Switches",
    "Router",
    "Ethernet Patch Cord",
    "Node",
    "STB",
    "Dish",
    "Adopter",
    "Cable Ties",
    "Others",
  ]

  const labelClass = "block text-[11px] font-medium text-slate-600 mb-1.5"
  const controlClass = "w-full h-9 pl-9 pr-9 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150 appearance-none"
  const inputClass = "w-full h-9 pl-9 pr-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"

  const renderTextField = (
    label: string,
    name: string,
    value: string,
    icon: React.ReactNode,
    placeholder: string,
    required = false,
  ) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{icon}</div>
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleAttributeChange}
          placeholder={placeholder}
          className={inputClass}
          required={required}
        />
      </div>
    </div>
  )

  const renderTypeSpecificFields = () => {
    switch (selectedItemType) {
      case "EtherNet Cable":
        return (
          <div className="space-y-4">
            {renderTextField("Cable Type", "type", attributes.type || "", <Paperclip className="h-4 w-4" />, "Enter cable type")}
          </div>
        )

      case "ONT":
      case "ONU":
      case "Router":
      case "STB":
        return (
          <div className="space-y-4">
            {renderTextField("Serial Number", "serial_number", attributes.serial_number || "", <Barcode className="h-4 w-4" />, "Enter serial number", true)}
            {renderTextField("Type", "type", attributes.type || "", <Cpu className="h-4 w-4" />, "Enter device type")}
            {renderTextField("Model", "model", attributes.model || "", <Monitor className="h-4 w-4" />, "Enter model")}
          </div>
        )

      case "Fibe OPTIC Patch Cord":
      case "Ethernet Patch Cord":
      case "Node":
        return (
          <div className="space-y-4">
            {renderTextField("Type", "type", attributes.type || "", <Wifi className="h-4 w-4" />, "Enter type")}
          </div>
        )

      case "Switches":
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Switch Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Wifi className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="switch_type"
                  value={attributes.switch_type || ""}
                  onChange={(e) => handleAttributeChange({ target: { name: "type", value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                  placeholder="Enter switch type"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )

      case "Dish":
        return (
          <div className="space-y-4">
            {renderTextField("MAC Address", "mac_address", attributes.mac_address || "", <Barcode className="h-4 w-4" />, "Enter MAC address", true)}
            {renderTextField("Type", "type", attributes.type || "", <Radio className="h-4 w-4" />, "Enter dish type")}
          </div>
        )

      case "Adopter":
        return (
          <div className="space-y-4">
            {renderTextField("Volt", "volt", attributes.volt || "", <Plug className="h-4 w-4" />, "Enter volt")}
            {renderTextField("Amp", "amp", attributes.amp || "", <Plug className="h-4 w-4" />, "Enter amp")}
          </div>
        )

      case "Cable Ties":
        return (
          <div className="space-y-4">
            {renderTextField("Type", "type", attributes.type || "", <Paperclip className="h-4 w-4" />, "Enter tie type")}
            {renderTextField("Model", "model", attributes.model || "", <Package className="h-4 w-4" />, "Enter model")}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">

      {/* Item Type */}
      <div className="space-y-2">
        <label className={labelClass}>Item Type <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Box className="h-4 w-4" />
          </div>
          <select
            name="item_type"
            value={formData.item_type || ""}
            onChange={(e) => {
              handleInputChange(e)
              setSelectedItemType(e.target.value)
            }}
            className={controlClass}
            required
          >
            <option value="">Select Item Type</option>
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Type-specific fields */}
      {selectedItemType && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-[10px]">
          <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Item Specifications</span>
          </div>
          {renderTypeSpecificFields()}
        </div>
      )}

      {/* Vendor */}
      <div className="space-y-2">
        <label className={labelClass}>Vendor <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Truck className="h-4 w-4" />
          </div>
          <select
            name="vendor"
            value={formData.vendor || ""}
            onChange={handleInputChange}
            className={controlClass}
            required
          >
            <option value="">Select Vendor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quantity and Unit Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quantity */}
        <div className="space-y-2">
          <label className={labelClass}>Quantity <span className="text-rose-500 ml-0.5">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Layers className="h-4 w-4" />
            </div>
            <input
              type="number"
              name="quantity"
              value={formData.quantity || ""}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Unit Price */}
        <div className="space-y-2">
          <label className={labelClass}>Unit Price</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[11px] text-slate-400 font-medium">PKR</span>
            </div>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price || ""}
              onChange={handleInputChange}
              placeholder="Enter unit price"
              step="0.01"
              min="0"
              className="w-full h-9 pl-10 pr-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
