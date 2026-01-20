import { useState, useEffect, useRef } from 'react';
import type { Concept, ConceptDetail, Topic } from '../types';

interface ConceptEditModalProps {
  concept: Concept;
  topics: Topic[];
  onSave: (concept: Concept) => Promise<Concept | null>;
  onUploadImage: (conceptId: string, file: File) => Promise<string | null>;
  onClose: () => void;
}

const topicColors: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  lime: 'bg-lime-100 text-lime-700',
  slate: 'bg-slate-100 text-slate-700',
  orange: 'bg-orange-100 text-orange-700',
  stone: 'bg-stone-100 text-stone-700',
  purple: 'bg-purple-100 text-purple-700',
};

export default function ConceptEditModal({
  concept,
  topics,
  onSave,
  onUploadImage,
  onClose,
}: ConceptEditModalProps) {
  const [name, setName] = useState(concept.name);
  const [tagline, setTagline] = useState(concept.tagline);
  const [category, setCategory] = useState(concept.category);
  const [layer, setLayer] = useState(concept.layer);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(concept.topics);
  const [details, setDetails] = useState<ConceptDetail[]>(concept.details);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailChange = (index: number, field: 'title' | 'description', value: string) => {
    setDetails((prev) =>
      prev.map((detail, i) => (i === index ? { ...detail, [field]: value } : detail))
    );
  };

  const addDetail = () => {
    setDetails((prev) => [...prev, { title: '', description: '' }]);
  };

  const removeDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If there's a new image, upload it first
      let imageName = concept.image;
      if (imageFile) {
        const uploadedImage = await onUploadImage(concept.id, imageFile);
        if (uploadedImage) {
          imageName = uploadedImage;
        }
      }

      const updatedConcept: Concept = {
        id: concept.id,
        name,
        tagline,
        category,
        layer,
        image: imageName,
        topics: selectedTopics,
        details: details.filter((d) => d.title.trim() || d.description.trim()),
      };

      await onSave(updatedConcept);
      onClose();
    } catch (err) {
      console.error('Error saving concept:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start">
          <div>
            <div className="text-xs text-stone-400 mb-1">Edit Concept</div>
            <h2 className="text-2xl font-light text-stone-800">Edit: {concept.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Basic Info */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Tagline
                </label>
                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Category & Layer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Layer
                  </label>
                  <input
                    type="text"
                    value={layer}
                    onChange={(e) => setLayer(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        selectedTopics.includes(topic.id)
                          ? topicColors[topic.color] || topicColors.stone
                          : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Image & Details */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Image
                </label>
                <div className="rounded-xl overflow-hidden mb-2 bg-stone-100 relative">
                  <img
                    src={imagePreview || `/images/concepts/${concept.image}`}
                    alt={concept.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors text-sm"
                >
                  {imageFile ? `Selected: ${imageFile.name}` : 'Upload New Image'}
                </button>
              </div>

              {/* Details */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-stone-700">
                    How it works
                  </label>
                  <button
                    onClick={addDetail}
                    className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200"
                  >
                    + Add Detail
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-auto">
                  {details.map((detail, idx) => (
                    <div key={idx} className="bg-stone-50 rounded-lg p-3 relative">
                      <button
                        onClick={() => removeDetail(idx)}
                        className="absolute top-2 right-2 text-stone-400 hover:text-red-500 text-sm"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={detail.title}
                        onChange={(e) => handleDetailChange(idx, 'title', e.target.value)}
                        placeholder="Title"
                        className="w-full px-2 py-1 border border-stone-200 rounded mb-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <textarea
                        value={detail.description}
                        onChange={(e) => handleDetailChange(idx, 'description', e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-2 py-1 border border-stone-200 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
