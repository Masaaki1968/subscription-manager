import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    monthlyCost: '',
    billingCycle: 'monthly',
    category: ''
  });

  // ローカルストレージからデータ読み込み
  useEffect(() => {
    const saved = localStorage.getItem('subscriptions');
    if (saved) {
      setSubscriptions(JSON.parse(saved));
    }
  }, []);

  // データをローカルストレージに保存
  const saveToStorage = (data) => {
    localStorage.setItem('subscriptions', JSON.stringify(data));
  };

  // 月額総額を計算
  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      const cost = parseFloat(sub.monthlyCost) || 0;
      return total + (sub.billingCycle === 'yearly' ? cost / 12 : cost);
    }, 0);
  };

  // フォームリセット
  const resetForm = () => {
    setFormData({
      serviceName: '',
      monthlyCost: '',
      billingCycle: 'monthly',
      category: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  // サブスク追加・更新
  const handleSubmit = () => {
    if (!formData.serviceName || !formData.monthlyCost) {
      alert('サービス名と料金は必須です');
      return;
    }

    const newSub = {
      id: editingId || Date.now().toString(),
      serviceName: formData.serviceName,
      monthlyCost: parseFloat(formData.monthlyCost),
      billingCycle: formData.billingCycle,
      category: formData.category || 'その他',
      createdAt: editingId ? subscriptions.find(s => s.id === editingId)?.createdAt : new Date().toISOString()
    };

    let updatedSubs;
    if (editingId) {
      updatedSubs = subscriptions.map(sub => 
        sub.id === editingId ? newSub : sub
      );
    } else {
      updatedSubs = [...subscriptions, newSub];
    }

    setSubscriptions(updatedSubs);
    saveToStorage(updatedSubs);
    resetForm();
  };

  // 編集開始
  const startEdit = (sub) => {
    setFormData({
      serviceName: sub.serviceName,
      monthlyCost: sub.monthlyCost.toString(),
      billingCycle: sub.billingCycle,
      category: sub.category
    });
    setEditingId(sub.id);
    setShowForm(true);
  };

  // 削除確認
  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  // 削除実行
  const executeDeletion = () => {
    if (deleteConfirm) {
      const updatedSubs = subscriptions.filter(sub => sub.id !== deleteConfirm);
      setSubscriptions(updatedSubs);
      saveToStorage(updatedSubs);
      setDeleteConfirm(null);
    }
  };

  // 削除キャンセル
  const cancelDeletion = () => {
    setDeleteConfirm(null);
  };

  // カテゴリ別色分け
  const getCategoryColor = (category) => {
    const colors = {
      'アプリ': 'bg-purple-100 text-purple-800',
      'ストレージ': 'bg-blue-100 text-blue-800',
      '生成': 'bg-green-100 text-green-800',
      'その他': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['その他'];
  };

  return (
    <>
      <Head>
        <title>サブスクリプション管理</title>
        <meta name="description" content="サブスクリプション管理アプリ" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            サブスクリプション管理
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              登録サービス: {subscriptions.length}件
            </p>
            <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-lg font-semibold text-green-800">
                月額総額: ¥{calculateMonthlyTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 追加ボタン */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規追加
          </button>
        </div>

        {/* フォーム */}
        {showForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'サブスクリプション編集' : '新規サブスクリプション追加'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    サービス名 *
                  </label>
                  <input
                    type="text"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Netflix, Spotify..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    料金 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyCost}
                    onChange={(e) => setFormData({...formData, monthlyCost: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    課金サイクル
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">月額</option>
                    <option value="yearly">年額</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリ
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="アプリ">アプリ</option>
                    <option value="ストレージ">ストレージ</option>
                    <option value="生成">生成</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingId ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 削除確認モーダル */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">削除確認</h3>
              <p className="text-gray-600 mb-6">
                「{subscriptions.find(s => s.id === deleteConfirm)?.serviceName}」を削除しますか？
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={cancelDeletion}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={executeDeletion}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* サブスクリスト */}
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              まだサブスクリプションが登録されていません
            </p>
            <p className="text-gray-400 mt-2">
              「新規追加」ボタンから最初のサービスを追加してみましょう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 min-w-0 flex-shrink-0">
                      {sub.serviceName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(sub.category)}`}>
                      {sub.category}
                    </span>
                    <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
                      ¥{sub.monthlyCost.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {sub.billingCycle === 'monthly' ? '月額' : '年額'}
                    </span>
                    {sub.billingCycle === 'yearly' && (
                      <span className="text-sm text-green-600 whitespace-nowrap">
                        (月額換算: ¥{Math.round(sub.monthlyCost / 12).toLocaleString()})
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(sub)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(sub.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
