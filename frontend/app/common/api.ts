import { siteId, url } from './settings';
import { BASE_URL, API_BASE } from './constants';
import { Config, Comment, Tree, User, BlockedUser, Sorting, BlockTTL, Image } from './types';
import fetcher from './fetcher';

export const getConfig = (): Promise<Config> => fetcher.get('/config');

export const logout = (): Promise<void> => fetcher.get('/auth/logout', { overriddenApiBase: '' });

export const getPostComments = (sort: Sorting) => fetcher.get<Tree>(`/find?url=${url}&sort=${sort}&format=tree`);

export const getCommentsCount = (urls: string[]): Promise<{ url: string; count: number }[]> =>
  fetcher.post('/counts', { json: urls });

export const getComment = (id: Comment['id']): Promise<Comment> => fetcher.get(`/id/${id}?url=${url}`);

export const getUserComments = (
  userId: User['id'],
  limit: number
): Promise<{
  comments: Comment[];
  count: number;
}> => fetcher.get(`/comments?user=${userId}&limit=${limit}`);

export const putCommentVote = ({ id, value }: { id: Comment['id']; value: number }): Promise<void> =>
  fetcher.put(`/vote/${id}?url=${url}&vote=${value}`);

export const addComment = ({
  title,
  text,
  pid,
}: {
  title: string;
  text: string;
  pid?: Comment['id'];
}): Promise<Comment> =>
  fetcher.post('/comment', {
    json: {
      title,
      text,
      locator: {
        site: siteId,
        url,
      },
      ...(pid ? { pid } : {}),
    },
  });

export const updateComment = ({ text, id }: { text: string; id: Comment['id'] }): Promise<Comment> =>
  fetcher.put(`/comment/${id}?url=${url}`, { json: { text } });

export const getPreview = (text: string): Promise<string> => fetcher.post('/preview', { json: { text } });

export const getUser = (): Promise<User | null> => fetcher.get<User | null>('/user').catch(() => null);

/* GDPR */

export const deleteMe = (): Promise<{
  user_id: string;
  link: string;
}> => fetcher.post(`/deleteme?site=${siteId}`);

export const approveDeleteMe = (token: string): Promise<void> => fetcher.get(`/admin/deleteme?token=${token}`);

/* admin */
export const pinComment = (id: Comment['id']): Promise<void> => fetcher.put(`/admin/pin/${id}?url=${url}&pin=1`);
export const unpinComment = (id: Comment['id']): Promise<void> => fetcher.put(`/admin/pin/${id}?url=${url}&pin=0`);
export const setVerifiedStatus = (id: User['id']): Promise<void> => fetcher.put(`/admin/verify/${id}?verified=1`);
export const removeVerifiedStatus = (id: User['id']): Promise<void> => fetcher.put(`/admin/verify/${id}?verified=0`);
export const removeComment = (id: Comment['id']): Promise<void> => fetcher.delete(`/admin/comment/${id}?url=${url}`);

export const removeMyComment = (id: Comment['id']): Promise<void> =>
  fetcher.put(`/comment/${id}?url=${url}`, { json: { delete: true } });

export const blockUser = (
  id: User['id'],
  ttl: BlockTTL
): Promise<{
  block: boolean;
  site_id: string;
  user_id: string;
}> => fetcher.put(ttl === 'permanently' ? `/admin/user/${id}?block=1` : `/admin/user/${id}?block=1&ttl=${ttl}`);

export const unblockUser = (
  id: User['id']
): Promise<{
  block: boolean;
  site_id: string;
  user_id: string;
}> => fetcher.put(`/admin/user/${id}?block=0`);

export const getBlocked = (): Promise<BlockedUser[] | null> => fetcher.get('/admin/blocked');

export const disableComments = (): Promise<void> => fetcher.put(`/admin/readonly?url=${url}&ro=1`);

export const enableComments = (): Promise<void> => fetcher.put(`/admin/readonly?url=${url}&ro=0`);

export const uploadImage = (image: File): Promise<Image> => {
  const data = new FormData();
  data.append('file', image);

  return fetcher
    .post<{ id: string }>(`/picture`, {
      headers: { 'Content-Type': 'multipart/form-data' },
      body: data,
    })
    .then((resp) => ({
      name: image.name,
      size: image.size,
      type: image.type,
      url: `${BASE_URL + API_BASE}/picture/${resp.id}`,
    }));
};

/**
 * Start process of email subscription to updates
 * @param emailAddress email for subscription
 */
export const emailVerificationForSubscribe = (emailAddress: string) =>
  fetcher.post(`/email/subscribe?address=${encodeURIComponent(emailAddress)}`);

/**
 * Confirmation of email subscription to updates
 * @param token confirmation token from email
 */
export const emailConfirmationForSubscribe = (token: string) =>
  fetcher.post(`/email/confirm?tkn=${encodeURIComponent(token)}`);

/**
 * Decline current subscription to updates
 */
export const unsubscribeFromEmailUpdates = (): Promise<void> => fetcher.delete(`/email`);
