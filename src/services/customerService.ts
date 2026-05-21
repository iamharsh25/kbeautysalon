import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Customer, CustomerMembership, CustomerVoucher } from '../types';

type CustomerRow = {
  id: string;
  profile_picture_url: string | null;
  full_name: string;
  email: string | null;
  mobile: string | null;
  address_line1: string | null;
  notes: string | null;
};

type CustomerMembershipRow = {
  customer_id: string;
  is_member: boolean;
  start_date: string | null;
  end_date: string | null;
  fee_cents: number | null;
  paid_date: string | null;
};

type VoucherTemplateRow = {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
};

type ClientVoucherRow = {
  id: string;
  customer_id: string;
  status: 'available' | 'used' | 'expired' | 'cancelled';
  starts_at: string | null;
  expires_at: string | null;
  vouchers: VoucherTemplateRow | VoucherTemplateRow[] | null;
};

type BookingHistoryRow = {
  customer_id: string;
  appointment_start: string;
  amount_paid_cents: number | null;
  payment_method: 'cash' | 'card' | 'upi' | null;
  discount_cents: number | null;
  service_menu: { name: string } | { name: string }[] | null;
  staff_profiles: { display_name: string } | { display_name: string }[] | null;
  client_vouchers: {
    vouchers: { code: string } | { code: string }[] | null;
  } | {
    vouchers: { code: string } | { code: string }[] | null;
  }[] | null;
};

const CUSTOMER_COLUMNS = 'id,profile_picture_url,full_name,email,mobile,address_line1,notes';
const MEMBERSHIP_COLUMNS = 'customer_id,is_member,start_date,end_date,fee_cents,paid_date';

function firstRelation<T>(relation: T | T[] | null | undefined) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function toDateOnly(date: string | null | undefined) {
  return date ? date.slice(0, 10) : '';
}

function mapMembership(row?: CustomerMembershipRow): CustomerMembership {
  return {
    isMember: row?.is_member ?? false,
    startDate: row?.start_date ?? '',
    endDate: row?.end_date ?? '',
    fee: Math.round((row?.fee_cents ?? 0) / 100),
    paidDate: row?.paid_date ?? '',
  };
}

function mapCustomerVoucher(row: ClientVoucherRow): CustomerVoucher {
  const voucher = firstRelation(row.vouchers);
  return {
    id: row.id,
    voucherCode: voucher?.code ?? 'UNKNOWN',
    startDate: toDateOnly(row.starts_at),
    expiryDate: toDateOnly(row.expires_at),
    status: row.status === 'used' ? 'Voucher Used' : 'Voucher Not Used',
    discountType: voucher?.discount_type === 'percentage' ? 'Percentage Off' : 'Amount Off',
    discountValue: voucher?.discount_type === 'percentage' ? `${voucher.discount_value}%` : `₹${voucher?.discount_value ?? 0}`,
  };
}

function mapCustomer(
  row: CustomerRow,
  memberships: CustomerMembershipRow[],
  vouchers: ClientVoucherRow[],
  histories: BookingHistoryRow[],
): Customer {
  return {
    id: row.id,
    profilePictureUrl: row.profile_picture_url || '/homepage/logo-wo-bg.png',
    fullName: row.full_name,
    email: row.email || '',
    mobile: row.mobile || '',
    address: row.address_line1 || '',
    notes: row.notes || '',
    membership: mapMembership(memberships.find((membership) => membership.customer_id === row.id)),
    serviceHistory: histories
      .filter((history) => history.customer_id === row.id)
      .map((history) => {
        const service = firstRelation(history.service_menu);
        const staff = firstRelation(history.staff_profiles);
        const clientVoucher = firstRelation(history.client_vouchers);
        const voucher = firstRelation(clientVoucher?.vouchers);

        return {
          date: toDateOnly(history.appointment_start),
          time: new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(history.appointment_start)),
          serviceName: service?.name ?? 'Service',
          staffName: staff?.display_name ?? 'Staff',
          amountPaid: Math.round((history.amount_paid_cents ?? 0) / 100),
          paymentMethod: history.payment_method === 'card' ? 'Card' : history.payment_method === 'upi' ? 'UPI' : 'Cash',
          discountAmount: Math.round((history.discount_cents ?? 0) / 100),
          voucherUsed: voucher?.code ?? '-',
        };
      }),
    vouchers: vouchers.filter((voucher) => voucher.customer_id === row.id).map(mapCustomerVoucher),
  };
}

export async function getCustomers() {
  if (!isSupabaseConfigured || !supabase) return [];

  const [customersResult, membershipsResult, vouchersResult, historiesResult] = await Promise.all([
    supabase.from('customers').select(CUSTOMER_COLUMNS).order('full_name', { ascending: true }),
    supabase.from('customer_memberships').select(MEMBERSHIP_COLUMNS),
    supabase.from('client_vouchers').select('id,customer_id,status,starts_at,expires_at,vouchers(id,code,discount_type,discount_value)'),
    supabase
      .from('booking_details')
      .select('customer_id,appointment_start,amount_paid_cents,payment_method,discount_cents,service_menu(name),staff_profiles(display_name),client_vouchers(vouchers(code))')
      .order('appointment_start', { ascending: false }),
  ]);

  if (customersResult.error) throw new Error(customersResult.error.message);
  if (membershipsResult.error) throw new Error(membershipsResult.error.message);
  if (vouchersResult.error) throw new Error(vouchersResult.error.message);
  if (historiesResult.error) throw new Error(historiesResult.error.message);

  return ((customersResult.data ?? []) as CustomerRow[]).map((customer) =>
    mapCustomer(
      customer,
      (membershipsResult.data ?? []) as CustomerMembershipRow[],
      (vouchersResult.data ?? []) as ClientVoucherRow[],
      (historiesResult.data ?? []) as BookingHistoryRow[],
    ),
  );
}

export async function createCustomer(customer: Customer) {
  if (!isSupabaseConfigured || !supabase) return customer;

  const { data, error } = await supabase
    .from('customers')
    .insert({
      profile_picture_url: customer.profilePictureUrl,
      full_name: customer.fullName,
      email: customer.email || null,
      mobile: customer.mobile || null,
      address_line1: customer.address || null,
      notes: customer.notes || null,
    })
    .select(CUSTOMER_COLUMNS)
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Customer could not be created.');

  const createdCustomer = { ...customer, id: (data as CustomerRow).id };
  await upsertCustomerMembership(createdCustomer.id, createdCustomer.membership);

  for (const voucher of createdCustomer.vouchers) {
    await assignCustomerVoucher(createdCustomer.id, voucher);
  }

  return createdCustomer;
}

export async function updateCustomer(customer: Customer) {
  if (!isSupabaseConfigured || !supabase) return customer;

  const { error } = await supabase
    .from('customers')
    .update({
      profile_picture_url: customer.profilePictureUrl,
      full_name: customer.fullName,
      email: customer.email || null,
      mobile: customer.mobile || null,
      address_line1: customer.address || null,
      notes: customer.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customer.id);

  if (error) throw new Error(error.message);
  await upsertCustomerMembership(customer.id, customer.membership);

  return customer;
}

export async function upsertCustomerMembership(customerId: string, membership: CustomerMembership) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from('customer_memberships')
    .upsert({
      customer_id: customerId,
      is_member: membership.isMember,
      start_date: membership.startDate || null,
      end_date: membership.endDate || null,
      fee_cents: Math.round(membership.fee * 100),
      paid_date: membership.paidDate || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'customer_id' });

  if (error) throw new Error(error.message);
}

export async function assignCustomerVoucher(customerId: string, voucher: CustomerVoucher) {
  if (!isSupabaseConfigured || !supabase) return voucher;

  const { data: existingVoucherTemplate, error: voucherError } = await supabase
    .from('vouchers')
    .select('id')
    .eq('code', voucher.voucherCode)
    .maybeSingle();

  if (voucherError) throw new Error(voucherError.message);
  let voucherTemplate = existingVoucherTemplate;
  if (!voucherTemplate?.id) {
    const numericValue = Number(voucher.discountValue.replace(/[^0-9.]/g, '')) || 1;
    const { data: createdVoucher, error: createVoucherError } = await supabase
      .from('vouchers')
      .insert({
        code: voucher.voucherCode,
        title: voucher.voucherCode,
        description: `${voucher.discountType} voucher`,
        discount_type: voucher.discountType === 'Percentage Off' ? 'percentage' : 'fixed',
        discount_value: Math.round(numericValue),
        is_active: true,
      })
      .select('id')
      .single();

    if (createVoucherError || !createdVoucher) {
      throw new Error(createVoucherError?.message ?? 'Voucher template could not be created.');
    }

    voucherTemplate = createdVoucher;
  }

  const { data, error } = await supabase
    .from('client_vouchers')
    .insert({
      customer_id: customerId,
      voucher_id: voucherTemplate.id,
      status: 'available',
      starts_at: voucher.startDate || null,
      expires_at: voucher.expiryDate || null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return { ...voucher, id: data?.id };
}

export async function deleteCustomerVoucher(customerId: string, voucherCode: string, voucherAssignmentId?: string) {
  if (!isSupabaseConfigured || !supabase) return;

  if (voucherAssignmentId) {
    const { error } = await supabase
      .from('client_vouchers')
      .delete()
      .eq('id', voucherAssignmentId);

    if (error) throw new Error(error.message);
    return;
  }

  const { data: voucherTemplate, error: voucherError } = await supabase
    .from('vouchers')
    .select('id')
    .eq('code', voucherCode)
    .maybeSingle();

  if (voucherError) throw new Error(voucherError.message);
  if (!voucherTemplate?.id) return;

  const { error } = await supabase
    .from('client_vouchers')
    .delete()
    .eq('customer_id', customerId)
    .eq('voucher_id', voucherTemplate.id);

  if (error) throw new Error(error.message);
}
