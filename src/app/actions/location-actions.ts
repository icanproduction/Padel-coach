'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateLocationInput, UpdateLocationInput } from '@/types/database'

export async function getAllLocations() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch locations' }
  }
}

export async function getLocationById(locationId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch location' }
  }
}

export async function createLocation(input: CreateLocationInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can create locations' }
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: input.name,
        address: input.address,
        courts: input.courts,
        maps_link: input.maps_link || null,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/locations')
    return { data }
  } catch {
    return { error: 'Failed to create location' }
  }
}

export async function updateLocation(locationId: string, input: UpdateLocationInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can update locations' }
    }

    const updateData = { ...input }
    if ('maps_link' in updateData && !updateData.maps_link) {
      updateData.maps_link = undefined
    }

    const { data, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', locationId)
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/locations')
    return { data }
  } catch {
    return { error: 'Failed to update location' }
  }
}

export async function deleteLocation(locationId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can delete locations' }
    }

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('locations')
      .update({ is_active: false })
      .eq('id', locationId)

    if (error) return { error: error.message }

    revalidatePath('/admin/locations')
    return { success: true }
  } catch {
    return { error: 'Failed to delete location' }
  }
}
