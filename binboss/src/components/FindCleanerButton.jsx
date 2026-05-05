function FindCleanerButton({ isSearching, onFindCleaner }) {
  return (
    <button
      className={`primary-action ${isSearching ? 'primary-action--searching' : ''}`}
      disabled={isSearching}
      onClick={onFindCleaner}
      type="button"
    >
      {isSearching ? 'Searching...' : 'Find cleaner'}
    </button>
  )
}

export default FindCleanerButton
