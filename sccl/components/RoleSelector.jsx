"use client";

import React from 'react';

export default function RoleSelector({ selectedRole, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Register As</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('student')}
          className={`py-2.5 px-4 rounded-lg border font-medium transition-all duration-200 ${
            selectedRole === 'student'
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          🎓 Student
        </button>
        <button
          type="button"
          onClick={() => onChange('admin')}
          className={`py-2.5 px-4 rounded-lg border font-medium transition-all duration-200 ${
            selectedRole === 'admin'
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          🛠️ Admin
        </button>
      </div>
    </div>
  );
}