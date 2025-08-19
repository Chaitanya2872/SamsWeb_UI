import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import { useStructureRemarks } from '../../hooks/useStructures';
import { useAuthUser } from '../../hooks/useAuth';
import type { Remark } from '../../types/structure';

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  structureId: string | null;
}

export const RemarksModal: React.FC<RemarksModalProps> = ({
  isOpen,
  onClose,
  structureId,
}) => {
  const user = useAuthUser();
  const {
    remarks,
    isLoading,
    error,
    addRemark,
    updateRemark,
    deleteRemark,
  } = useStructureRemarks(structureId);

  const [newRemarkText, setNewRemarkText] = useState('');
  const [editingRemark, setEditingRemark] = useState<{ id: string; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRemark = async () => {
    if (!newRemarkText.trim()) return;

    setIsSubmitting(true);
    try {
      await addRemark(newRemarkText.trim());
      setNewRemarkText('');
    } catch (error) {
      console.error('Failed to add remark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRemark = async () => {
    if (!editingRemark || !editingRemark.text.trim()) return;

    setIsSubmitting(true);
    try {
      await updateRemark(editingRemark.id, editingRemark.text.trim());
      setEditingRemark(null);
    } catch (error) {
      console.error('Failed to update remark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    if (!confirm('Are you sure you want to delete this remark?')) return;

    setIsSubmitting(true);
    try {
      await deleteRemark(remarkId);
    } catch (error) {
      console.error('Failed to delete remark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEditRemark = (remark: Remark) => {
    return user && (
      (user.role === 'VE' && remark.author_role === 'VE') ||
      (user.role === 'FE' && remark.author_role === 'FE') ||
      user.role === 'AD'
    );
  };

  if (!isOpen || !structureId) return null;

  const allRemarks = [
    ...(remarks?.fe_remarks || []).map((r: any) => ({ ...r, type: 'FE' })),
    ...(remarks?.ve_remarks || []).map((r: any) => ({ ...r, type: 'VE' })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Structure Remarks"
      size="lg"
    >
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {remarks && (
        <div className="space-y-6">
          {/* Add New Remark */}
          {user && (user.role === 'VE' || user.role === 'FE' || user.role === 'AD') && (
            <div className="card p-4">
              <h4 className="font-medium text-gray-900 mb-3">Add New Remark</h4>
              <div className="space-y-3">
                <Textarea
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder="Enter your remark..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddRemark}
                    variant="primary"
                    size="sm"
                    disabled={!newRemarkText.trim() || isSubmitting}
                    isLoading={isSubmitting}
                    leftIcon={<PlusIcon className="h-4 w-4" />}
                  >
                    Add Remark
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Remarks List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              All Remarks ({allRemarks.length})
            </h4>

            {allRemarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No remarks yet.</p>
                {user && (user.role === 'VE' || user.role === 'FE') && (
                  <p className="text-sm mt-1">Be the first to add a remark!</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {allRemarks.map((remark) => (
                  <div key={remark._id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {remark.author_name}
                          </span>
                        </div>
                        <Badge
                          variant={remark.author_role === 'VE' ? 'blue' : 'green'}
                          size="sm"
                        >
                          {remark.author_role}
                        </Badge>
                      </div>

                      {canEditRemark(remark) && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRemark({
                              id: remark._id!,
                              text: remark.text
                            })}
                            disabled={isSubmitting}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRemark(remark._id!)}
                            disabled={isSubmitting}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingRemark?.id === remark._id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editingRemark?.text || ''}
                          onChange={(e) => setEditingRemark((prev) => ({
                            ...prev,
                            text: e.target.value,
                            id: prev?.id || ''
                          }))}
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRemark(null)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleUpdateRemark}
                            disabled={!editingRemark?.text.trim() || isSubmitting}
                            isLoading={isSubmitting}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-700 whitespace-pre-wrap mb-3">
                          {remark.text}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {format(new Date(remark.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          {remark.updated_at !== remark.created_at && (
                            <span>(edited)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Updated Info */}
          {remarks.last_updated_by && (
            <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-4">
              Last updated by {remarks.last_updated_by.name} ({remarks.last_updated_by.role}) on{' '}
              {format(new Date(remarks.last_updated_by.date), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};