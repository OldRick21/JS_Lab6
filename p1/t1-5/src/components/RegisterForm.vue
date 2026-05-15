<template>
  <div class="wrapper">
    <div class="card">
      <h1 class="title">Create account</h1>
      <p class="subtitle">Join us today</p>

      <Form @submit="onSubmit" v-slot="{ meta }">

        <!-- Email -->
        <div class="field">
          <label class="label">Email</label>
          <Field
            name="email"
            :rules="validateEmail"
            v-slot="{ field, meta: fieldMeta }"
          >
            <input
              v-bind="field"
              type="email"
              placeholder="you@example.com"
              class="input"
              :class="{
                'input--error':   fieldMeta.dirty && !fieldMeta.valid,
                'input--success': fieldMeta.dirty &&  fieldMeta.valid
              }"
            />
          </Field>
          <ErrorMessage name="email" class="error-msg" />
        </div>

        <!-- Password -->
        <div class="field">
          <label class="label">Password</label>
          <Field
            name="password"
            :rules="validatePassword"
            v-slot="{ field, meta: fieldMeta }"
          >
            <input
              v-bind="field"
              type="password"
              placeholder="Create a strong password"
              class="input"
              :class="{
                'input--error':   fieldMeta.dirty && !fieldMeta.valid,
                'input--success': fieldMeta.dirty &&  fieldMeta.valid
              }"
              @input="onPasswordInput(field.value)"
            />
          </Field>
          <ErrorMessage name="password" class="error-msg" />

          <!-- список критериев -->
          <ul class="criteria">
            <li
              v-for="c in criteria"
              :key="c.label"
              :class="c.met ? 'met' : 'unmet'"
            >
              {{ c.label }}
            </li>
          </ul>
        </div>

        <!-- Checkbox -->
        <div class="field">
          <Field
            name="agree"
            :rules="validateAgree"
            v-slot="{ field }"
          >
            <label class="checkbox-label">
              <input
                v-bind="field"
                type="checkbox"
                class="checkbox"
                :value="true"
                :checked="field.value"
              />
              <span>I agree with <a href="#" class="link">license agreement</a></span>
            </label>
          </Field>
          <ErrorMessage name="agree" class="error-msg" />
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn"
          :disabled="!meta.valid"
        >
          Register
        </button>

      </Form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'

// ── критерии пароля ────────────────────────────────────────────────
const criteria = ref([
  { label: 'Длина не менее 8',       test: v => v.length >= 8,              met: false },
  { label: 'Цифры',                  test: v => /\d/.test(v),               met: false },
  { label: 'Буквы нижнего регистра', test: v => /[a-z]/.test(v),            met: false },
  { label: 'Буквы верхнего регистра',test: v => /[A-Z]/.test(v),            met: false },
  { label: 'Спецсимволы',            test: v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v), met: false },
])

function onPasswordInput(value) {
  criteria.value.forEach(c => { c.met = c.test(value ?? '') })
}

// ── правила валидации ──────────────────────────────────────────────
function validateEmail(value) {
  if (!value) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(value)) return 'Enter a valid email address'
  return true
}

function validatePassword(value) {
  if (!value) return 'Password is required'
  if (value.length < 8)           return 'At least 8 characters required'
  if (!/\d/.test(value))          return 'Must contain a digit'
  if (!/[a-z]/.test(value))       return 'Must contain a lowercase letter'
  if (!/[A-Z]/.test(value))       return 'Must contain an uppercase letter'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
                                   return 'Must contain a special character'
  return true
}

function validateAgree(value) {
  if (!value) return 'You must agree to the license agreement'
  return true
}

function onSubmit(values) {
  alert(`Registered as ${values.email}`)
}
</script>

<style scoped>
.wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f4f0;
  font-family: 'Georgia', serif;
}

.card {
  background: #ffffff;
  border: 1px solid #e0ddd5;
  border-radius: 4px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
}

.title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin: 0 0 32px;
  font-family: 'Arial', sans-serif;
}

.field {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.input {
  width: 100%;
  box-sizing: border-box;
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid #d0cdc5;
  border-radius: 3px;
  font-size: 15px;
  color: #1a1a1a;
  background: #fafaf8;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.input:focus {
  border-color: #555;
  background: #fff;
}

.input--error   { border-color: #c0392b !important; background: #fff8f8; }
.input--success { border-color: #27ae60 !important; background: #f8fff9; }

/* ── критерии ───────────────────────────────────── */
.criteria {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.criteria li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-family: 'Arial', sans-serif;
  transition: color 0.15s;
}

.criteria li.met   { color: #27ae60; }
.criteria li.unmet { color: #c0392b; }

.criteria li::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
}

/* ── checkbox ───────────────────────────────────── */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-family: 'Arial', sans-serif;
  user-select: none;
}

.checkbox {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  accent-color: #1a1a1a;
  cursor: pointer;
}

.link { color: #1a1a1a; text-decoration: underline; }
.link:hover { color: #555; }

.error-msg {
  display: block;
  font-size: 12px;
  color: #c0392b;
  margin-top: 5px;
  font-family: 'Arial', sans-serif;
}

/* ── button ─────────────────────────────────────── */
.btn {
  width: 100%;
  height: 44px;
  margin-top: 8px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 15px;
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.btn:hover:not(:disabled) { background: #333; }

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>