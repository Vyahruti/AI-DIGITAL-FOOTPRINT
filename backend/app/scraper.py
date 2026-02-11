"""
Web Scraping Service
"""
import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Optional
from urllib.parse import urlparse

def scrape_text_from_url(url: str) -> str:
    """
    Scrapes the text content from a given URL.

    Args:
        url: The URL to scrape.

    Returns:
        The extracted text content from the URL.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove script and style elements
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()

        # Get text
        text = soup.get_text()

        # Break into lines and remove leading/trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return text

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        raise ValueError(f"Could not fetch content from the URL: {e}")
    except Exception as e:
        print(f"Error parsing URL {url}: {e}")
        raise ValueError(f"Could not parse content from the URL: {e}")


def scrape_linkedin_profile(profile_url: str) -> Dict:
    """
    Scrapes public information from a LinkedIn profile URL.
    
    Args:
        profile_url: LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)
    
    Returns:
        Dictionary containing profile information and detected privacy risks
    """
    try:
        # Validate LinkedIn URL
        if 'linkedin.com' not in profile_url:
            raise ValueError("Invalid LinkedIn URL. Must be a linkedin.com profile link.")
        
        # Use headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(profile_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract profile data
        profile_data = {
            'url': profile_url,
            'name': None,
            'headline': None,
            'about': None,
            'location': None,
            'profile_picture_url': None,
            'experience': [],
            'education': [],
            'contact_info': {},
            'exposed_pii': [],
            'privacy_issues': [],
            'public_visibility': {}
        }
        
        # Extract name
        name_elem = soup.find('h1', class_=re.compile('.*top-card.*name.*|.*profile.*name.*', re.I))
        if not name_elem:
            name_elem = soup.find('h1')
        if name_elem:
            profile_data['name'] = name_elem.get_text(strip=True)
            profile_data['public_visibility']['name'] = True
        
        # Extract headline
        headline_elem = soup.find(class_=re.compile('.*headline.*|.*top-card.*occupation.*', re.I))
        if headline_elem:
            profile_data['headline'] = headline_elem.get_text(strip=True)
            profile_data['public_visibility']['headline'] = True
        
        # Extract location
        location_elem = soup.find(class_=re.compile('.*location.*|.*geo.*', re.I))
        if location_elem:
            profile_data['location'] = location_elem.get_text(strip=True)
            profile_data['public_visibility']['location'] = True
            profile_data['privacy_issues'].append({
                'type': 'location_exposed',
                'severity': 'medium',
                'message': f"Your location '{profile_data['location']}' is publicly visible"
            })
        
        # Extract about section
        about_elem = soup.find(class_=re.compile('.*about.*section.*|.*summary.*', re.I))
        if about_elem:
            about_text = about_elem.get_text(strip=True)
            profile_data['about'] = about_text
            profile_data['public_visibility']['about'] = True
            
            # Check for PII in about section
            pii_patterns = {
                'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                'phone': r'\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
                'address': r'\b\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct)\b'
            }
            
            for pii_type, pattern in pii_patterns.items():
                matches = re.findall(pattern, about_text, re.I)
                if matches:
                    for match in matches:
                        profile_data['exposed_pii'].append({
                            'type': pii_type,
                            'value': match if isinstance(match, str) else match[0],
                            'location': 'About section'
                        })
                        profile_data['privacy_issues'].append({
                            'type': f'{pii_type}_in_about',
                            'severity': 'high' if pii_type in ['email', 'phone'] else 'medium',
                            'message': f"{pii_type.capitalize()} found in About section - should be kept private"
                        })
        
        # Check if profile picture is visible
        img_elem = soup.find('img', class_=re.compile('.*profile.*photo.*|.*avatar.*', re.I))
        if img_elem and img_elem.get('src'):
            profile_data['profile_picture_url'] = img_elem['src']
            profile_data['public_visibility']['profile_picture'] = True
        
        # Analyze overall privacy risk
        profile_data['privacy_score'] = _calculate_linkedin_privacy_score(profile_data)
        
        # Generate recommendations
        profile_data['recommendations'] = _generate_linkedin_recommendations(profile_data)
        
        return profile_data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching LinkedIn profile {profile_url}: {e}")
        raise ValueError(f"Could not fetch LinkedIn profile. The profile may be private or require login. Error: {e}")
    except Exception as e:
        print(f"Error parsing LinkedIn profile {profile_url}: {e}")
        raise ValueError(f"Could not parse LinkedIn profile data: {e}")


def _calculate_linkedin_privacy_score(profile_data: Dict) -> Dict:
    """Calculate privacy risk score for LinkedIn profile"""
    risk_score = 0
    max_score = 100
    
    # Exposed PII (40 points)
    pii_count = len(profile_data['exposed_pii'])
    if pii_count > 0:
        risk_score += min(40, pii_count * 15)
    
    # Public visibility (30 points)
    visible_fields = sum(1 for v in profile_data['public_visibility'].values() if v)
    risk_score += min(30, visible_fields * 5)
    
    # Location exposed (15 points)
    if profile_data.get('location'):
        risk_score += 15
    
    # About section length (15 points - more info = more risk)
    if profile_data.get('about'):
        about_length = len(profile_data['about'])
        if about_length > 500:
            risk_score += 15
        elif about_length > 200:
            risk_score += 10
        elif about_length > 0:
            risk_score += 5
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "HIGH RISK"
    elif risk_score >= 40:
        risk_level = "MEDIUM RISK"
    else:
        risk_level = "LOW RISK"
    
    return {
        'score': min(risk_score, max_score),
        'level': risk_level,
        'max_score': max_score
    }


def _generate_linkedin_recommendations(profile_data: Dict) -> List[str]:
    """Generate privacy recommendations for LinkedIn profile"""
    recommendations = []
    
    if profile_data['exposed_pii']:
        recommendations.append("🔴 URGENT: Remove personal contact information (email/phone) from your About section")
        recommendations.append("Use LinkedIn's messaging system instead of exposing direct contact details")
    
    if profile_data.get('location'):
        recommendations.append("⚠️ Consider making your location more general (e.g., 'San Francisco Bay Area' instead of exact city)")
    
    if len(profile_data['public_visibility']) > 3:
        recommendations.append("Review your LinkedIn privacy settings to limit public visibility")
        recommendations.append("Go to Settings & Privacy → Visibility → Edit your public profile")
    
    if profile_data.get('about') and len(profile_data['about']) > 500:
        recommendations.append("Your About section is very detailed - review for sensitive information")
    
    if not recommendations:
        recommendations.append("✅ Good privacy practices! Your profile has minimal exposed PII")
        recommendations.append("Continue to avoid sharing personal contact details publicly")
    
    return recommendations


def scan_github_profile(username: str, github_token: Optional[str] = None) -> Dict:
    """
    Scan a GitHub profile for privacy risks using GitHub API.
    
    Args:
        username: GitHub username (e.g., 'octocat')
        github_token: Optional GitHub personal access token for higher rate limits
    
    Returns:
        Dictionary containing profile info, exposed secrets, and privacy risks
    """
    try:
        headers = {
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'AI-Privacy-Scanner'
        }
        
        if github_token:
            headers['Authorization'] = f'Bearer {github_token}'
        
        base_url = 'https://api.github.com'
        
        result = {
            'username': username,
            'profile': {},
            'repositories': [],
            'exposed_secrets': [],
            'privacy_issues': [],
            'commit_emails': set(),
            'privacy_score': {},
            'recommendations': []
        }
        
        # Get profile info
        profile_response = requests.get(f'{base_url}/users/{username}', headers=headers, timeout=10)
        profile_response.raise_for_status()
        profile_data = profile_response.json()
        
        result['profile'] = {
            'name': profile_data.get('name'),
            'bio': profile_data.get('bio'),
            'location': profile_data.get('location'),
            'email': profile_data.get('email'),
            'company': profile_data.get('company'),
            'blog': profile_data.get('blog'),
            'twitter_username': profile_data.get('twitter_username'),
            'public_repos': profile_data.get('public_repos', 0),
            'followers': profile_data.get('followers', 0),
            'created_at': profile_data.get('created_at'),
        }
        
        # Check profile for exposed PII
        if result['profile']['email']:
            result['privacy_issues'].append({
                'type': 'email_in_profile',
                'severity': 'high',
                'message': f"Email '{result['profile']['email']}' is publicly visible in profile",
                'location': 'Profile'
            })
        
        if result['profile']['location']:
            result['privacy_issues'].append({
                'type': 'location_exposed',
                'severity': 'medium',
                'message': f"Location '{result['profile']['location']}' is public",
                'location': 'Profile'
            })
        
        # Get public repositories
        repos_response = requests.get(
            f'{base_url}/users/{username}/repos',
            headers=headers,
            params={'per_page': 30, 'sort': 'updated'},
            timeout=10
        )
        repos_response.raise_for_status()
        repos = repos_response.json()
        
        # Scan repositories for secrets (limit to first 5 for performance)
        secret_patterns = {
            'aws_key': r'AKIA[0-9A-Z]{16}',
            'openai_key': r'sk-[a-zA-Z0-9]{48}',
            'github_token': r'ghp_[a-zA-Z0-9]{36}',
            'api_key': r'api[_-]?key["\']?\s*[:=]\s*["\']([a-zA-Z0-9_-]{32,})',
        }
        
        for repo in repos[:5]:  # Limit to 5 repos for faster scanning
            repo_info = {
                'name': repo['name'],
                'description': repo.get('description'),
                'private': repo.get('private', False),
                'has_issues': len(result['exposed_secrets']) > 0
            }
            result['repositories'].append(repo_info)
            
            # Search for common sensitive files (reduced for speed)
            sensitive_files = ['.env', 'config.json']
            
            for filename in sensitive_files:
                try:
                    file_response = requests.get(
                        f"{base_url}/repos/{username}/{repo['name']}/contents/{filename}",
                        headers=headers,
                        timeout=3
                    )
                    if file_response.status_code == 200:
                        result['exposed_secrets'].append({
                            'type': 'sensitive_file',
                            'file': filename,
                            'repo': repo['name'],
                            'severity': 'critical',
                            'message': f"Sensitive file '{filename}' found in public repo"
                        })
                except:
                    pass
            
            # Get README content to scan for secrets (with shorter timeout)
            try:
                readme_response = requests.get(
                    f"{base_url}/repos/{username}/{repo['name']}/readme",
                    headers={**headers, 'Accept': 'application/vnd.github.raw'},
                    timeout=3
                )
                if readme_response.status_code == 200:
                    readme_content = readme_response.text[:5000]  # Limit content size
                    
                    # Check for critical patterns only
                    for pattern_name, pattern in secret_patterns.items():
                        if pattern_name in ['aws_key', 'openai_key', 'github_token', 'api_key']:
                            matches = re.findall(pattern, readme_content, re.I)
                            if matches:
                                result['exposed_secrets'].append({
                                    'type': pattern_name,
                                    'repo': repo['name'],
                                    'file': 'README.md',
                                    'severity': 'critical',
                                    'message': f"Potential {pattern_name.replace('_', ' ')} found in README"
                                })
            except:
                pass
            
            # Get recent commits to extract emails (only for first 3 repos)
            if repos.index(repo) < 3:  # Only check first 3 repos for speed
                try:
                    commits_response = requests.get(
                        f"{base_url}/repos/{username}/{repo['name']}/commits",
                        headers=headers,
                        params={'per_page': 5},
                        timeout=3
                    )
                    if commits_response.status_code == 200:
                        commits = commits_response.json()
                        for commit in commits[:5]:  # Limit commits checked
                            author_email = commit.get('commit', {}).get('author', {}).get('email')
                            if author_email and not author_email.endswith('@users.noreply.github.com'):
                                result['commit_emails'].add(author_email)
                except:
                    pass
        
        # Convert set to list for JSON serialization
        result['commit_emails'] = list(result['commit_emails'])
        
        # Add privacy issues for exposed emails
        for email in result['commit_emails']:
            result['privacy_issues'].append({
                'type': 'email_in_commits',
                'severity': 'medium',
                'message': f"Email '{email}' exposed in commit history",
                'location': 'Git commits'
            })
        
        # Calculate privacy score
        result['privacy_score'] = _calculate_github_privacy_score(result)
        
        # Generate recommendations
        result['recommendations'] = _generate_github_recommendations(result)
        
        return result
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found")
        elif e.response.status_code == 403:
            raise ValueError("GitHub API rate limit exceeded. Try again later or provide a GitHub token.")
        else:
            raise ValueError(f"GitHub API error: {e}")
    except Exception as e:
        raise ValueError(f"Failed to scan GitHub profile: {e}")


def _calculate_github_privacy_score(data: Dict) -> Dict:
    """Calculate privacy risk score for GitHub profile"""
    risk_score = 0
    max_score = 100
    
    # Exposed secrets (50 points max)
    secrets_count = len(data['exposed_secrets'])
    if secrets_count > 0:
        risk_score += min(50, secrets_count * 15)
    
    # Exposed emails (20 points)
    if len(data['commit_emails']) > 0:
        risk_score += 20
    
    # Profile email exposed (15 points)
    if data['profile'].get('email'):
        risk_score += 15
    
    # Location exposed (10 points)
    if data['profile'].get('location'):
        risk_score += 10
    
    # Privacy issues (5 points each)
    risk_score += min(15, len(data['privacy_issues']) * 5)
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "HIGH RISK"
    elif risk_score >= 40:
        risk_level = "MEDIUM RISK"
    else:
        risk_level = "LOW RISK"
    
    return {
        'score': min(risk_score, max_score),
        'level': risk_level,
        'max_score': max_score
    }


def _generate_github_recommendations(data: Dict) -> List[str]:
    """Generate privacy recommendations for GitHub profile"""
    recommendations = []
    
    if data['exposed_secrets']:
        recommendations.append("🔴 CRITICAL: Exposed secrets detected! Rotate all API keys and passwords immediately")
        recommendations.append("Remove sensitive files from repository history using git filter-branch or BFG Repo-Cleaner")
        recommendations.append("Add .gitignore to prevent future commits of sensitive files")
    
    if data['commit_emails']:
        recommendations.append("⚠️ Personal email exposed in commit history")
        recommendations.append("Configure Git to use GitHub's private email: Settings → Emails → 'Keep my email private'")
        recommendations.append(f"Use: git config --global user.email '{data['username']}@users.noreply.github.com'")
    
    if data['profile'].get('email'):
        recommendations.append("⚠️ Email is public in your profile")
        recommendations.append("Go to Settings → Profile → Uncheck 'Public email'")
    
    if len(data['repositories']) > 20:
        recommendations.append("ℹ️ You have many public repositories - review each for sensitive data")
    
    if not recommendations:
        recommendations.append("✅ Good security practices! No major privacy risks detected")
        recommendations.append("Continue to avoid committing secrets and use private emails in Git")
    
    return recommendations

