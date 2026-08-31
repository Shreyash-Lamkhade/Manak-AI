import Button from './Button'

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-md shadow-modal border border-[#E4E1DA] w-full max-w-sm p-6">
        <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">{title}</h3>
        <p className="text-sm text-[#5C5A55] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Remove</Button>
        </div>
      </div>
    </div>
  )
}
