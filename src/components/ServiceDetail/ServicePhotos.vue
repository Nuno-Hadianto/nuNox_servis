<template>
  <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px">
    <h3
      style="
        margin-bottom: 15px;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      📸 Dokumentasi Visual
    </h3>

    <div style="display: flex; gap: 15px; margin-bottom: 15px">
      <label
        class="btn btn-secondary"
        style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem"
      >
        + Foto Sebelum
        <input
          type="file"
          style="display: none"
          accept="image/*"
          @change="(e) => $emit('upload', e, 'Sebelum')"
        />
      </label>
      <label
        class="btn btn-secondary"
        style="cursor: pointer; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem"
      >
        + Foto Sesudah
        <input
          type="file"
          style="display: none"
          accept="image/*"
          @change="(e) => $emit('upload', e, 'Sesudah')"
        />
      </label>
    </div>

    <div
      v-if="photos.length > 0"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 10px;
      "
    >
      <div
        v-for="p in photos"
        :key="p.id"
        style="
          position: relative;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--glass-border);
          aspect-ratio: 1;
          background: var(--bg-color);
        "
      >
        <img
          :src="'file:///' + p.filepath.replace(/\\\\/g, '/')"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.2s;
          "
          @click="previewImage = p.filepath"
          class="photo-thumbnail"
        />
        <div
          style="
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            font-size: 0.7rem;
            padding: 4px;
            text-align: center;
            backdrop-filter: blur(4px);
          "
        >
          {{ p.photo_type }}
        </div>
        <button
          @click="$emit('delete', p.id)"
          style="
            position: absolute;
            top: 4px;
            right: 4px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          "
        >
          &times;
        </button>
      </div>
    </div>
    <div v-else style="color: var(--text-muted); font-size: 0.85rem; font-style: italic">
      Belum ada foto dokumentasi.
    </div>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div
        v-if="previewImage"
        class="modal show"
        @click.self="previewImage = null"
        style="background: rgba(0, 0, 0, 0.85); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; display: flex; justify-content: center; align-items: center;"
      >
        <div
          style="
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          "
        >
          <span
            class="close-modal"
            @click="previewImage = null"
            style="
              position: absolute;
              top: -40px;
              right: 0;
              color: white;
              font-size: 2.5rem;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
              cursor: pointer;
            "
            >&times;</span
          >
          <img
            :src="'file:///' + previewImage.replace(/\\\\/g, '/')"
            style="
              max-width: 100%;
              max-height: 85vh;
              border-radius: 8px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
              object-fit: contain;
            "
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Photo } from '../../../shared/types'

defineProps<{
  photos: Photo[]
}>()

defineEmits(['upload', 'delete'])

const previewImage = ref<string | null>(null)
</script>
